import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { isNonEmptyString, isNull } from '@sniptt/guards';
import { type CountryCode } from 'libphonenumber-js';
import chunk from 'lodash.chunk';
import compact from 'lodash.compact';
import {
  ConnectedAccountProvider,
  FieldActorSource,
  type FullNameMetadata,
} from 'zyra-shared/types';
import { isDefined } from 'zyra-shared/utils';
import { type DeepPartial, type Repository } from 'typeorm';
import { v4 } from 'uuid';

import { ExceptionHandlerService } from 'src/engine/core-modules/exception-handler/exception-handler.service';
import { UserWorkspaceEntity } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { type ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import { GlobalWorkspaceOrmManager } from 'src/engine/zyra-orm/global-workspace-datasource/global-workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/zyra-orm/utils/build-system-auth-context.util';
import { CONTACTS_CREATION_BATCH_SIZE } from 'src/modules/contact-creation-manager/constants/contacts-creation-batch-size.constant';
import { CreateCompanyService } from 'src/modules/contact-creation-manager/services/create-company.service';
import { CreatePersonService } from 'src/modules/contact-creation-manager/services/create-person.service';
import { type Contact } from 'src/modules/contact-creation-manager/types/contact.type';
import { filterOutContactsThatBelongToSelfOrWorkspaceMembers } from 'src/modules/contact-creation-manager/utils/filter-out-contacts-that-belong-to-self-or-workspace-members.util';
import { getDomainNameFromHandle } from 'src/modules/contact-creation-manager/utils/get-domain-name-from-handle.util';
import { getFirstNameAndLastNameFromHandleAndDisplayName } from 'src/modules/contact-creation-manager/utils/get-first-name-and-last-name-from-handle-and-display-name.util';
import { getUniqueContactsAndHandles } from 'src/modules/contact-creation-manager/utils/get-unique-contacts-and-handles.util';
import { addPersonEmailFiltersToQueryBuilder } from 'src/modules/match-participant/utils/add-person-email-filters-to-query-builder';
import { addPersonPhoneFiltersToQueryBuilder } from 'src/modules/match-participant/utils/add-person-phone-filters-to-query-builder';
import { findPersonByPrimaryOrAdditionalPhoneNumber } from 'src/modules/match-participant/utils/find-person-by-primary-or-additional-phone-number';
import { normalizePhoneHandleForMatching } from 'src/modules/match-participant/utils/normalize-phone-handle-for-matching';
import { parseFunnelLeadPhone } from 'src/engine/metadata-modules/funnel-page/utils/parse-funnel-lead-phone.util';
import { PersonWorkspaceEntity } from 'src/modules/person/standard-objects/person.workspace-entity';
import { WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';
import { computeDisplayName } from 'src/utils/compute-display-name';
import { isWorkDomain, isWorkEmail } from 'src/utils/is-work-email';

@Injectable()
export class CreateCompanyAndPersonService {
  constructor(
    private readonly createPersonService: CreatePersonService,
    private readonly createCompaniesService: CreateCompanyService,
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
    private readonly exceptionHandlerService: ExceptionHandlerService,
    @InjectRepository(UserWorkspaceEntity)
    private readonly userWorkspaceRepository: Repository<UserWorkspaceEntity>,
    @InjectRepository(WorkspaceEntity)
    private readonly workspaceRepository: Repository<WorkspaceEntity>,
  ) {}

  async createCompaniesAndPeople(
    connectedAccount: ConnectedAccountEntity,
    contactsToCreate: Contact[],
    workspaceId: string,
    source: FieldActorSource,
    accountOwner: WorkspaceMemberWorkspaceEntity | null,
  ): Promise<DeepPartial<PersonWorkspaceEntity>[]> {
    if (!contactsToCreate || contactsToCreate.length === 0) {
      return [];
    }

    const authContext = buildSystemAuthContext(workspaceId);

    return this.globalWorkspaceOrmManager.executeInWorkspaceContext(
      async () => {
        const personRepository =
          await this.globalWorkspaceOrmManager.getRepository(
            workspaceId,
            PersonWorkspaceEntity,
            {
              shouldBypassPermissionChecks: true,
            },
          );

        const workspaceMemberRepository =
          await this.globalWorkspaceOrmManager.getRepository(
            workspaceId,
            WorkspaceMemberWorkspaceEntity,
            { shouldBypassPermissionChecks: true },
          );

        const workspaceMembers = await workspaceMemberRepository.find();

        const workspace = await this.workspaceRepository.findOne({
          where: { id: workspaceId },
          select: ['id', 'isInternalMessagesImportEnabled'],
        });

        const peopleToCreateFromOtherCompanies =
          filterOutContactsThatBelongToSelfOrWorkspaceMembers(
            contactsToCreate,
            connectedAccount,
            workspaceMembers,
            workspace?.isInternalMessagesImportEnabled ?? false,
          );

        const { uniqueContacts, uniqueHandles } = getUniqueContactsAndHandles(
          peopleToCreateFromOtherCompanies,
        );

        if (uniqueHandles.length === 0) {
          return [];
        }

        const emailHandles = uniqueHandles.filter((handle) =>
          handle.includes('@'),
        );
        const phoneHandles = uniqueHandles
          .filter((handle) => !handle.includes('@'))
          .map(normalizePhoneHandleForMatching);

        const alreadyCreatedPeopleByEmail =
          emailHandles.length > 0
            ? await addPersonEmailFiltersToQueryBuilder({
                queryBuilder: personRepository.createQueryBuilder('person'),
                emails: emailHandles,
              })
                .orderBy('person.createdAt', 'ASC')
                .withDeleted()
                .getMany()
            : [];

        const alreadyCreatedPeopleByPhone =
          phoneHandles.length > 0
            ? await addPersonPhoneFiltersToQueryBuilder({
                queryBuilder: personRepository.createQueryBuilder('person'),
                phoneNumbers: phoneHandles,
              })
                .orderBy('person.createdAt', 'ASC')
                .withDeleted()
                .getMany()
            : [];

        const alreadyCreatedPeople = [
          ...alreadyCreatedPeopleByEmail,
          ...alreadyCreatedPeopleByPhone,
        ];

        const {
          contactsThatNeedPersonCreate,
          contactsThatNeedPersonRestore,
          peopleToEnrichNames,
          workDomainNamesToCreate,
          shouldCreateOrRestorePeopleByHandleMap,
        } =
          this.computeContactsThatNeedPersonCreateAndRestoreAndWorkDomainNamesToCreate(
            uniqueContacts,
            alreadyCreatedPeople,
            source,
            connectedAccount,
            accountOwner,
          );

        const companiesMap =
          await this.createCompaniesService.createOrRestoreCompanies(
            workDomainNamesToCreate,
            workspaceId,
          );

        const peopleToCreate = this.formatPeopleToCreateFromContacts({
          contactsToCreate: contactsThatNeedPersonCreate,
          createdBy: {
            source: source,
            workspaceMember: accountOwner,
            context: {
              provider: connectedAccount.provider,
            },
          },
          companiesMap,
        });

        const createdPeople = await this.createPersonService.createPeople(
          peopleToCreate,
          workspaceId,
        );

        const peopleToRestore = this.formatPeopleToRestoreFromContacts({
          contactsToRestore: contactsThatNeedPersonRestore,
          companiesMap,
          shouldCreateOrRestorePeopleByHandleMap,
        });

        const restoredPeople = await this.createPersonService.restorePeople(
          peopleToRestore,
          workspaceId,
        );

        await this.createPersonService.enrichPeopleNames(
          peopleToEnrichNames,
          workspaceId,
        );

        return { ...createdPeople, ...restoredPeople };
      },
      authContext,
    );
  }

  async createCompaniesAndPeopleAndUpdateParticipants(
    connectedAccount: ConnectedAccountEntity,
    contactsToCreate: Contact[],
    workspaceId: string,
    source: FieldActorSource,
  ) {
    const contactsBatches = chunk(
      contactsToCreate,
      CONTACTS_CREATION_BATCH_SIZE,
    );

    const authContext = buildSystemAuthContext(workspaceId);

    const accountOwner =
      await this.globalWorkspaceOrmManager.executeInWorkspaceContext(
        async () => {
          const userWorkspace = await this.userWorkspaceRepository.findOne({
            where: { id: connectedAccount.userWorkspaceId },
          });

          if (!userWorkspace) {
            throw new Error(
              `UserWorkspace with id ${connectedAccount.userWorkspaceId} not found`,
            );
          }

          const workspaceMemberRepository =
            await this.globalWorkspaceOrmManager.getRepository(
              workspaceId,
              WorkspaceMemberWorkspaceEntity,
              { shouldBypassPermissionChecks: true },
            );

          return workspaceMemberRepository.findOne({
            where: { userId: userWorkspace.userId },
          });
        },
        authContext,
      );

    for (const contactsBatch of contactsBatches) {
      try {
        await this.createCompaniesAndPeople(
          connectedAccount,
          contactsBatch,
          workspaceId,
          source,
          accountOwner,
        );
      } catch (error) {
        this.exceptionHandlerService.captureExceptions([error], {
          workspace: {
            id: workspaceId,
          },
        });
      }
    }
  }

  computeContactsThatNeedPersonCreateAndRestoreAndWorkDomainNamesToCreate(
    uniqueContacts: Contact[],
    alreadyCreatedPeople: PersonWorkspaceEntity[],
    source: FieldActorSource,
    connectedAccount: ConnectedAccountEntity,
    accountOwner: WorkspaceMemberWorkspaceEntity | null,
  ) {
    const shouldCreateOrRestorePeopleByHandleMap = new Map<
      string,
      { existingPerson: PersonWorkspaceEntity }
    >();

    for (const contact of uniqueContacts) {
      if (!contact.handle.includes('@')) {
        const existingPersonByPhoneNumber =
          findPersonByPrimaryOrAdditionalPhoneNumber({
            people: alreadyCreatedPeople,
            phoneNumber: normalizePhoneHandleForMatching(contact.handle),
          });

        if (isDefined(existingPersonByPhoneNumber)) {
          shouldCreateOrRestorePeopleByHandleMap.set(
            contact.handle.toLowerCase(),
            { existingPerson: existingPersonByPhoneNumber },
          );
        }

        continue;
      }

      const existingPersonOnPrimaryEmail = alreadyCreatedPeople.find(
        (person) => {
          return (
            isNonEmptyString(person.emails?.primaryEmail) &&
            person.emails.primaryEmail.toLowerCase() ===
              contact.handle.toLowerCase()
          );
        },
      );

      if (isDefined(existingPersonOnPrimaryEmail)) {
        shouldCreateOrRestorePeopleByHandleMap.set(
          contact.handle.toLowerCase(),
          {
            existingPerson: existingPersonOnPrimaryEmail,
          },
        );
        continue;
      }

      const existingPersonOnAdditionalEmails = alreadyCreatedPeople.find(
        (person) => {
          return (
            Array.isArray(person.emails?.additionalEmails) &&
            person.emails.additionalEmails.some(
              (email) => email.toLowerCase() === contact.handle.toLowerCase(),
            )
          );
        },
      );

      if (!isDefined(existingPersonOnAdditionalEmails)) continue;

      shouldCreateOrRestorePeopleByHandleMap.set(contact.handle.toLowerCase(), {
        existingPerson: existingPersonOnAdditionalEmails,
      });
    }

    const contactsThatNeedPersonCreate = uniqueContacts.filter(
      (contact) =>
        !shouldCreateOrRestorePeopleByHandleMap.has(
          contact.handle.toLowerCase(),
        ),
    );

    const contactsThatNeedPersonRestore = uniqueContacts.filter((contact) => {
      const existingPerson = shouldCreateOrRestorePeopleByHandleMap.get(
        contact.handle.toLowerCase(),
      )?.existingPerson;

      if (!isDefined(existingPerson)) {
        return false;
      }

      return !isNull(existingPerson.deletedAt);
    });

    const peopleToEnrichNames = this.computePeopleToEnrichNames(
      uniqueContacts,
      shouldCreateOrRestorePeopleByHandleMap,
    );

    const workDomainNamesToCreate = compact(
      [...contactsThatNeedPersonCreate, ...contactsThatNeedPersonRestore]
        .map((contact) => {
          const companyDomainName = isWorkEmail(contact.handle)
            ? getDomainNameFromHandle(contact.handle)
            : undefined;

          if (!isDefined(companyDomainName) || !isWorkDomain(companyDomainName))
            return undefined;

          return {
            domainName: companyDomainName,
            createdBySource: source,
            createdByWorkspaceMember: accountOwner,
            createdByContext: {
              provider: connectedAccount.provider,
            },
          };
        })
        .filter(isDefined),
    );

    return {
      contactsThatNeedPersonCreate,
      contactsThatNeedPersonRestore,
      peopleToEnrichNames,
      workDomainNamesToCreate,
      shouldCreateOrRestorePeopleByHandleMap,
    };
  }

  // Stages per-personId name enrichments for existing People auto-created via
  // CALENDAR or EMAIL. Empty fields are filled from new sources (first
  // non-empty value wins across multiple contacts mapping to the same Person);
  // populated fields are never overwritten.
  private computePeopleToEnrichNames(
    uniqueContacts: Contact[],
    shouldCreateOrRestorePeopleByHandleMap: Map<
      string,
      { existingPerson: PersonWorkspaceEntity }
    >,
  ): { personId: string; name: FullNameMetadata }[] {
    const enrichmentByPersonId = new Map<
      string,
      { firstName: string; lastName: string }
    >();

    for (const contact of uniqueContacts) {
      const existingPerson = shouldCreateOrRestorePeopleByHandleMap.get(
        contact.handle.toLowerCase(),
      )?.existingPerson;

      if (!isDefined(existingPerson)) {
        continue;
      }

      // Soft-deleted matches are restored earlier in the same job, so the
      // enrichment UPDATE runs against an un-deleted row.
      const existingSource = existingPerson.createdBy?.source;

      if (
        existingSource !== FieldActorSource.CALENDAR &&
        existingSource !== FieldActorSource.EMAIL
      ) {
        continue;
      }

      const staged = enrichmentByPersonId.get(existingPerson.id);
      const currentFirstName =
        staged?.firstName ?? existingPerson.name?.firstName ?? '';
      const currentLastName =
        staged?.lastName ?? existingPerson.name?.lastName ?? '';
      const firstNameIsEmpty = !isNonEmptyString(currentFirstName);
      const lastNameIsEmpty = !isNonEmptyString(currentLastName);

      if (!firstNameIsEmpty && !lastNameIsEmpty) {
        continue;
      }

      const { firstName: parsedFirstName, lastName: parsedLastName } =
        getFirstNameAndLastNameFromHandleAndDisplayName(
          contact.handle,
          contact.displayName,
        );

      const enrichedFirstName =
        firstNameIsEmpty && isNonEmptyString(parsedFirstName)
          ? parsedFirstName
          : currentFirstName;
      const enrichedLastName =
        lastNameIsEmpty && isNonEmptyString(parsedLastName)
          ? parsedLastName
          : currentLastName;

      if (
        enrichedFirstName === currentFirstName &&
        enrichedLastName === currentLastName
      ) {
        continue;
      }

      enrichmentByPersonId.set(existingPerson.id, {
        firstName: enrichedFirstName,
        lastName: enrichedLastName,
      });
    }

    return Array.from(enrichmentByPersonId.entries()).map(
      ([personId, name]) => ({ personId, name }),
    );
  }

  formatPeopleToCreateFromContacts({
    contactsToCreate,
    createdBy,
    companiesMap,
  }: {
    contactsToCreate: {
      handle: string;
      displayName: string;
    }[];
    createdBy: {
      source: FieldActorSource;
      workspaceMember?: WorkspaceMemberWorkspaceEntity | null;
      context: {
        provider: ConnectedAccountProvider;
      };
    };
    companiesMap: Record<string, string>;
  }): Partial<PersonWorkspaceEntity>[] {
    return contactsToCreate.map((contact) => {
      const id = v4();

      const { handle, displayName } = contact;

      const { firstName, lastName } =
        getFirstNameAndLastNameFromHandleAndDisplayName(handle, displayName);
      const createdByName = computeDisplayName(createdBy.workspaceMember?.name);

      const createdBySnapshot = {
        source: createdBy.source,
        workspaceMemberId: createdBy.workspaceMember?.id ?? null,
        name: createdByName,
        context: createdBy.context,
      };

      if (!handle.includes('@')) {
        const parsedPhone = parseFunnelLeadPhone(handle);

        return {
          id,
          phones: {
            primaryPhoneNumber: parsedPhone?.primaryPhoneNumber ?? handle,
            primaryPhoneCallingCode: parsedPhone?.primaryPhoneCallingCode ?? '',
            // CountryCode is a strict ISO-code union with no "unknown" member;
            // '' is the codebase's existing convention for "no calling/country
            // code could be parsed" (see generate-column-definitions.util.spec.ts),
            // so the cast is safe here — this only happens for WhatsApp handles
            // parseFunnelLeadPhone couldn't parse a country code for.
            primaryPhoneCountryCode:
              parsedPhone?.primaryPhoneCountryCode ?? ('' as CountryCode),
            additionalPhones: null,
          },
          name: {
            firstName,
            lastName,
          },
          createdBy: createdBySnapshot,
        };
      }

      const companyId = companiesMap[getDomainNameFromHandle(handle)];

      return {
        id,
        emails: {
          primaryEmail: handle.toLowerCase(),
          additionalEmails: null,
        },
        name: {
          firstName,
          lastName,
        },
        companyId,
        createdBy: createdBySnapshot,
      };
    });
  }

  formatPeopleToRestoreFromContacts({
    contactsToRestore,
    companiesMap,
    shouldCreateOrRestorePeopleByHandleMap,
  }: {
    contactsToRestore: {
      handle: string;
      displayName: string;
    }[];
    companiesMap: Record<string, string>;
    shouldCreateOrRestorePeopleByHandleMap: Map<
      string,
      { existingPerson: PersonWorkspaceEntity | undefined }
    >;
  }): { personId: string; companyId: string | undefined }[] {
    const peopleToRestore = [];

    for (const contact of contactsToRestore) {
      const { handle } = contact;

      const existingPerson = shouldCreateOrRestorePeopleByHandleMap.get(
        handle.toLowerCase(),
      )?.existingPerson;

      if (!isDefined(existingPerson) || isNull(existingPerson.deletedAt))
        continue;

      const companyId = handle.includes('@')
        ? companiesMap[getDomainNameFromHandle(handle)]
        : undefined;

      peopleToRestore.push({
        personId: existingPerson.id,
        companyId,
      });
    }

    return peopleToRestore;
  }
}
