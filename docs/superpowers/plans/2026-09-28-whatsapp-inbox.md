# WhatsApp Inbox Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let a human see and reply to WhatsApp conversations inside the CRM — on a Person's record page and in a workspace-wide inbox — and make sure the AI agent backs off when a human takes over.

**Architecture:** Reuse the existing generic messaging model (`Message`/`MessageThread`/`MessageParticipant`/`MessageChannel`, already shared with email) instead of building a second WhatsApp-only store. The only missing link is that `MessageParticipant.personId` never gets set for WhatsApp participants today because the contact-matching code only understands email-shaped handles — fixing that (Task 1) makes the existing generic per-record messaging queries work for WhatsApp for free. A new minimal `sendWhatsappMessage` mutation (Task 2) reuses the outbound driver that's already wired up. The Person-page widget is registered as a first-class `WidgetType.WHATSAPP` in the existing configurable page-layout system (Task 5), the same mechanism `EMAILS`/`TIMELINE`/etc. already use.

**Tech Stack:** NestJS + TypeORM + GraphQL (zyra-server), React + Apollo + Jotai + Linaria (asturian-front), Jest for tests.

## Global Constraints

- No `any` types; types over interfaces; named exports only; no abbreviations in identifiers (per `CLAUDE.md`).
- Functional components only; event handlers preferred over `useEffect` for state updates.
- Files/dirs: kebab-case with descriptive suffixes (`.service.ts`, `.resolver.ts`, `.entity.ts`, `.dto.ts`, `.component.tsx`).
- Run `npx nx lint:diff-with-main <project>` and `npx nx typecheck <project>` after each task's changes, for whichever of `zyra-server` / `asturian-front` the task touched.
- Run tests with `npx jest <file> --config=packages/<project>/jest.config.mjs` for the specific files touched, not the full suite, per task.
- After any GraphQL schema change (new resolver/DTO/enum), run `npx nx run asturian-front:graphql:generate --configuration=metadata`.
- Comments: short `//` lines only, explaining WHY, never WHAT.

---

## Task 1: Fix phone-based contact matching

WhatsApp participants have a phone-number handle (e.g. `"5511999999999"`, no `@`). Today, two places assume every handle is an email address, so a WhatsApp contact either never gets linked to a Person, or gets a phone number stuffed into its email field:

- `MatchParticipantService.matchParticipants` (`packages/zyra-server/src/modules/match-participant/match-participant.service.ts`) is what actually sets `MessageParticipant.personId` on every message save (both inbound import and outbound send) — it only queries `person.emails`.
- `CreateCompanyAndPersonService` (`packages/zyra-server/src/modules/contact-creation-manager/services/create-company-and-contact.service.ts`) is what creates a new Person when no match exists — it skips the "already exists" check for non-`@` handles but still writes them into `emails.primaryEmail` when creating.

Without this fix, nothing built in later tasks can find "the WhatsApp thread for this Person."

**Files:**
- Create: `packages/zyra-server/src/modules/match-participant/utils/add-person-phone-filters-to-query-builder.ts`
- Create: `packages/zyra-server/src/modules/match-participant/utils/find-person-by-primary-or-additional-phone-number.ts`
- Create: `packages/zyra-server/src/modules/match-participant/utils/__tests__/add-person-phone-filters-to-query-builder.util.spec.ts`
- Create: `packages/zyra-server/src/modules/match-participant/utils/__tests__/find-person-by-primary-or-additional-phone-number.spec.ts`
- Modify: `packages/zyra-server/src/modules/match-participant/match-participant.service.ts`
- Modify: `packages/zyra-server/src/modules/contact-creation-manager/services/create-company-and-contact.service.ts`
- Test: `packages/zyra-server/src/modules/contact-creation-manager/services/__tests__/create-company-and-contact.service.spec.ts` (add cases)

**Interfaces:**
- Produces: `addPersonPhoneFiltersToQueryBuilder({ queryBuilder, phoneNumbers, excludePersonIds? }): SelectQueryBuilder<PersonWorkspaceEntity>`
- Produces: `findPersonByPrimaryOrAdditionalPhoneNumber({ people, phoneNumber }): PersonWorkspaceEntity | undefined`
- Consumes: `parseFunnelLeadPhone(rawPhone: string): { primaryPhoneNumber: string; primaryPhoneCallingCode?: string; primaryPhoneCountryCode?: string } | null` from `src/engine/metadata-modules/funnel-page/utils/parse-funnel-lead-phone.util.ts` (already exists, already tested).

- [ ] **Step 1: Write the failing tests for the new phone-matching util**

```typescript
// packages/zyra-server/src/modules/match-participant/utils/__tests__/find-person-by-primary-or-additional-phone-number.spec.ts
import { findPersonByPrimaryOrAdditionalPhoneNumber } from 'src/modules/match-participant/utils/find-person-by-primary-or-additional-phone-number';
import { type PersonWorkspaceEntity } from 'src/modules/person/standard-objects/person.workspace-entity';

describe('findPersonByPrimaryOrAdditionalPhoneNumber', () => {
  it('matches on the primary phone number', () => {
    const people = [
      {
        id: 'person-1',
        phones: { primaryPhoneNumber: '5511999999999', additionalPhones: null },
      } as unknown as PersonWorkspaceEntity,
    ];

    const result = findPersonByPrimaryOrAdditionalPhoneNumber({
      people,
      phoneNumber: '5511999999999',
    });

    expect(result?.id).toBe('person-1');
  });

  it('matches on an additional phone number', () => {
    const people = [
      {
        id: 'person-2',
        phones: {
          primaryPhoneNumber: '5511000000000',
          additionalPhones: [
            { number: '5511999999999', countryCode: 'BR', callingCode: '+55' },
          ],
        },
      } as unknown as PersonWorkspaceEntity,
    ];

    const result = findPersonByPrimaryOrAdditionalPhoneNumber({
      people,
      phoneNumber: '5511999999999',
    });

    expect(result?.id).toBe('person-2');
  });

  it('returns undefined when no person matches', () => {
    const result = findPersonByPrimaryOrAdditionalPhoneNumber({
      people: [],
      phoneNumber: '5511999999999',
    });

    expect(result).toBeUndefined();
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `cd packages/zyra-server && npx jest find-person-by-primary-or-additional-phone-number --config=jest.config.mjs`
Expected: FAIL — `Cannot find module 'src/modules/match-participant/utils/find-person-by-primary-or-additional-phone-number'`

- [ ] **Step 3: Implement `findPersonByPrimaryOrAdditionalPhoneNumber`**

```typescript
// packages/zyra-server/src/modules/match-participant/utils/find-person-by-primary-or-additional-phone-number.ts
import { type PersonWorkspaceEntity } from 'src/modules/person/standard-objects/person.workspace-entity';

export const findPersonByPrimaryOrAdditionalPhoneNumber = ({
  people,
  phoneNumber,
}: {
  people: PersonWorkspaceEntity[];
  phoneNumber: string;
}): PersonWorkspaceEntity | undefined => {
  const personWithPrimaryPhoneNumber = people.find(
    (person) => person.phones?.primaryPhoneNumber === phoneNumber,
  );

  if (personWithPrimaryPhoneNumber) {
    return personWithPrimaryPhoneNumber;
  }

  return people.find((person) => {
    const additionalPhones = person.phones?.additionalPhones;

    if (!Array.isArray(additionalPhones)) {
      return false;
    }

    return additionalPhones.some(
      (additionalPhone) => additionalPhone.number === phoneNumber,
    );
  });
};
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `cd packages/zyra-server && npx jest find-person-by-primary-or-additional-phone-number --config=jest.config.mjs`
Expected: PASS (3 tests)

- [ ] **Step 5: Write the failing test for the query builder util**

```typescript
// packages/zyra-server/src/modules/match-participant/utils/__tests__/add-person-phone-filters-to-query-builder.util.spec.ts
import { addPersonPhoneFiltersToQueryBuilder } from 'src/modules/match-participant/utils/add-person-phone-filters-to-query-builder';
import { type PersonWorkspaceEntity } from 'src/modules/person/standard-objects/person.workspace-entity';
import { type SelectQueryBuilder } from 'typeorm';

describe('addPersonPhoneFiltersToQueryBuilder', () => {
  const buildQueryBuilderMock = () => {
    const queryBuilder: Partial<SelectQueryBuilder<PersonWorkspaceEntity>> = {};

    queryBuilder.select = jest.fn().mockReturnValue(queryBuilder);
    queryBuilder.where = jest.fn().mockReturnValue(queryBuilder);
    queryBuilder.andWhere = jest.fn().mockReturnValue(queryBuilder);
    queryBuilder.orWhere = jest.fn().mockReturnValue(queryBuilder);
    queryBuilder.withDeleted = jest.fn().mockReturnValue(queryBuilder);

    return queryBuilder as SelectQueryBuilder<PersonWorkspaceEntity>;
  };

  it('filters on the primary phone number column', () => {
    const queryBuilder = buildQueryBuilderMock();

    addPersonPhoneFiltersToQueryBuilder({
      queryBuilder,
      phoneNumbers: ['5511999999999'],
    });

    expect(queryBuilder.where).toHaveBeenCalledWith(
      'person.phonesPrimaryPhoneNumber IN (:...phoneNumbers)',
      { phoneNumbers: ['5511999999999'] },
    );
  });

  it('adds a jsonb containment orWhere per phone number for additionalPhones', () => {
    const queryBuilder = buildQueryBuilderMock();

    addPersonPhoneFiltersToQueryBuilder({
      queryBuilder,
      phoneNumbers: ['5511999999999', '5511888888888'],
    });

    expect(queryBuilder.orWhere).toHaveBeenCalledWith(
      'person.phonesAdditionalPhones @> :phoneNumber0::jsonb',
      { phoneNumber0: JSON.stringify([{ number: '5511999999999' }]) },
    );
    expect(queryBuilder.orWhere).toHaveBeenCalledWith(
      'person.phonesAdditionalPhones @> :phoneNumber1::jsonb',
      { phoneNumber1: JSON.stringify([{ number: '5511888888888' }]) },
    );
  });

  it('excludes given person ids from both the primary and additional filters', () => {
    const queryBuilder = buildQueryBuilderMock();

    addPersonPhoneFiltersToQueryBuilder({
      queryBuilder,
      phoneNumbers: ['5511999999999'],
      excludePersonIds: ['person-1'],
    });

    expect(queryBuilder.andWhere).toHaveBeenCalledWith(
      'person.id NOT IN (:...excludePersonIds)',
      { excludePersonIds: ['person-1'] },
    );
    expect(queryBuilder.orWhere).toHaveBeenCalledWith(
      'person.id NOT IN (:...excludePersonIds) AND person.phonesAdditionalPhones @> :phoneNumber0::jsonb',
      {
        excludePersonIds: ['person-1'],
        phoneNumber0: JSON.stringify([{ number: '5511999999999' }]),
      },
    );
  });
});
```

- [ ] **Step 6: Run the test to verify it fails**

Run: `cd packages/zyra-server && npx jest add-person-phone-filters-to-query-builder --config=jest.config.mjs`
Expected: FAIL — module not found

- [ ] **Step 7: Implement `addPersonPhoneFiltersToQueryBuilder`**

```typescript
// packages/zyra-server/src/modules/match-participant/utils/add-person-phone-filters-to-query-builder.ts
import { type SelectQueryBuilder } from 'typeorm';

import { type PersonWorkspaceEntity } from 'src/modules/person/standard-objects/person.workspace-entity';

export interface AddPersonPhoneFiltersToQueryBuilderOptions {
  queryBuilder: SelectQueryBuilder<PersonWorkspaceEntity>;
  phoneNumbers: string[];
  excludePersonIds?: string[];
}

// Mirrors addPersonEmailFiltersToQueryBuilder, but phones.additionalPhones is
// a jsonb array of {number, countryCode, callingCode} objects rather than
// bare strings, so the containment check matches on the "number" key only.
export function addPersonPhoneFiltersToQueryBuilder({
  queryBuilder,
  phoneNumbers,
  excludePersonIds = [],
}: AddPersonPhoneFiltersToQueryBuilderOptions): SelectQueryBuilder<PersonWorkspaceEntity> {
  queryBuilder = queryBuilder
    .select([
      'person.id',
      'person.phonesPrimaryPhoneNumber',
      'person.phonesAdditionalPhones',
      'person.deletedAt',
    ])
    .where('person.phonesPrimaryPhoneNumber IN (:...phoneNumbers)', {
      phoneNumbers,
    })
    .withDeleted();

  if (excludePersonIds.length > 0) {
    queryBuilder = queryBuilder.andWhere(
      'person.id NOT IN (:...excludePersonIds)',
      { excludePersonIds },
    );
  }

  for (const [index, phoneNumber] of phoneNumbers.entries()) {
    const phoneNumberParamName = `phoneNumber${index}`;
    const orWhereIsInAdditionalPhones =
      excludePersonIds.length > 0
        ? `person.id NOT IN (:...excludePersonIds) AND person.phonesAdditionalPhones @> :${phoneNumberParamName}::jsonb`
        : `person.phonesAdditionalPhones @> :${phoneNumberParamName}::jsonb`;

    queryBuilder = queryBuilder.orWhere(orWhereIsInAdditionalPhones, {
      ...(excludePersonIds.length > 0 && { excludePersonIds }),
      [phoneNumberParamName]: JSON.stringify([{ number: phoneNumber }]),
    });
  }

  queryBuilder = queryBuilder.withDeleted();

  return queryBuilder;
}
```

- [ ] **Step 8: Run the test to verify it passes**

Run: `cd packages/zyra-server && npx jest add-person-phone-filters-to-query-builder --config=jest.config.mjs`
Expected: PASS (3 tests)

- [ ] **Step 9: Wire phone matching into `MatchParticipantService.matchParticipants`**

Open `packages/zyra-server/src/modules/match-participant/match-participant.service.ts`. Add these two imports:

```typescript
import { addPersonPhoneFiltersToQueryBuilder } from 'src/modules/match-participant/utils/add-person-phone-filters-to-query-builder';
import { findPersonByPrimaryOrAdditionalPhoneNumber } from 'src/modules/match-participant/utils/find-person-by-primary-or-additional-phone-number';
```

Replace the body of the `for (const participants of chunkedParticipants)` loop (currently lines 116–206, from `const uniqueParticipantsHandles = ...` through the closing of that `for` block) with:

```typescript
    for (const participants of chunkedParticipants) {
      const uniqueParticipantsHandles = [
        ...new Set(participants.map((participant) => participant.handle)),
      ].filter(isDefined);

      const emailHandles = uniqueParticipantsHandles.filter((handle) =>
        handle.includes('@'),
      );
      const phoneHandles = uniqueParticipantsHandles.filter(
        (handle) => handle.length > 0 && !handle.includes('@'),
      );

      const peopleMatchedByEmail =
        emailHandles.length > 0
          ? await addPersonEmailFiltersToQueryBuilder({
              queryBuilder: personRepository.createQueryBuilder('person'),
              emails: emailHandles,
            })
              .orderBy('person.createdAt', 'ASC')
              .getMany()
          : [];

      const peopleMatchedByPhone =
        phoneHandles.length > 0
          ? await addPersonPhoneFiltersToQueryBuilder({
              queryBuilder: personRepository.createQueryBuilder('person'),
              phoneNumbers: phoneHandles,
            })
              .orderBy('person.createdAt', 'ASC')
              .getMany()
          : [];

      const people = [...peopleMatchedByEmail, ...peopleMatchedByPhone];

      const workspaceMembers = await workspaceMemberRepository.find(
        {
          where: {
            userEmail: Any(uniqueParticipantsHandles),
          },
        },
        transactionManager,
      );

      const partipantsToBeUpdated = participants
        .map((participant) => ({
          ...participant,
          handle: participant.handle ?? '',
        }))
        .map((participant) => {
          const person = participant.handle.includes('@')
            ? findPersonByPrimaryOrAdditionalEmail({
                people,
                email: participant.handle,
              })
            : findPersonByPrimaryOrAdditionalPhoneNumber({
                people,
                phoneNumber: participant.handle,
              });

          const workspaceMember = workspaceMembers.find(
            (workspaceMember) =>
              workspaceMember.userEmail === participant.handle,
          );

          const shouldMatchWithPerson =
            matchWith === 'workspaceMemberAndPerson' ||
            matchWith === 'personOnly';

          const shouldMatchWithWorkspaceMember =
            matchWith === 'workspaceMemberAndPerson' ||
            matchWith === 'workspaceMemberOnly';

          const newParticipant = {
            ...participant,
            ...(shouldMatchWithPerson && {
              personId: isDefined(person) ? person.id : null,
            }),
            ...(shouldMatchWithWorkspaceMember && {
              workspaceMemberId: isDefined(workspaceMember)
                ? workspaceMember.id
                : null,
            }),
          };

          if (
            newParticipant.personId === participant.personId &&
            newParticipant.workspaceMemberId === participant.workspaceMemberId
          ) {
            return null;
          }

          return newParticipant;
        })
        .filter(isDefined);

      await participantRepository.updateMany(
        partipantsToBeUpdated.map((participant) => ({
          criteria: participant.id,
          partialEntity: {
            personId: participant.personId,
            workspaceMemberId: participant.workspaceMemberId,
          },
        })),
      );

      this.workspaceEventEmitter.emitCustomBatchEvent(
        `${objectMetadataName}_matched`,
        [
          {
            workspaceMemberId: null,
            participants: partipantsToBeUpdated,
          },
        ],
        workspaceId,
      );
    }
```

Note this removes the old single `addPersonEmailFiltersToQueryBuilder` call that ran against `uniqueParticipantsHandles` unconditionally — it's now split into the email-only and phone-only branches above, and `email` field lowercasing behavior is unchanged (still handled inside `addPersonEmailFiltersToQueryBuilder`/`findPersonByPrimaryOrAdditionalEmail`, which this diff does not touch).

- [ ] **Step 10: Typecheck and lint**

Run: `npx nx typecheck zyra-server`
Run: `npx nx lint:diff-with-main zyra-server`
Expected: no new errors.

- [ ] **Step 11: Fix contact creation/matching for phone handles in `CreateCompanyAndPersonService`**

Open `packages/zyra-server/src/modules/contact-creation-manager/services/create-company-and-contact.service.ts`. Add this import:

```typescript
import { addPersonPhoneFiltersToQueryBuilder } from 'src/modules/match-participant/utils/add-person-phone-filters-to-query-builder';
import { findPersonByPrimaryOrAdditionalPhoneNumber } from 'src/modules/match-participant/utils/find-person-by-primary-or-additional-phone-number';
import { parseFunnelLeadPhone } from 'src/engine/metadata-modules/funnel-page/utils/parse-funnel-lead-phone.util';
```

Replace the existing-people lookup block (currently lines 95–111, from `const { uniqueContacts, uniqueHandles } = ...` through `.withDeleted().getMany();`) with:

```typescript
        const { uniqueContacts, uniqueHandles } = getUniqueContactsAndHandles(
          peopleToCreateFromOtherCompanies,
        );

        if (uniqueHandles.length === 0) {
          return [];
        }

        const emailHandles = uniqueHandles.filter((handle) =>
          handle.includes('@'),
        );
        const phoneHandles = uniqueHandles.filter(
          (handle) => !handle.includes('@'),
        );

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
```

Now replace `computeContactsThatNeedPersonCreateAndRestoreAndWorkDomainNamesToCreate`'s top loop (currently the `for (const contact of uniqueContacts) { if (!contact.handle.includes('@')) { continue; } ... }` block) with:

```typescript
    for (const contact of uniqueContacts) {
      if (!contact.handle.includes('@')) {
        const existingPersonByPhoneNumber =
          findPersonByPrimaryOrAdditionalPhoneNumber({
            people: alreadyCreatedPeople,
            phoneNumber: contact.handle,
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
```

Now update `formatPeopleToCreateFromContacts` to branch on handle shape:

```typescript
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
            primaryPhoneCallingCode: parsedPhone?.primaryPhoneCallingCode ?? null,
            primaryPhoneCountryCode: parsedPhone?.primaryPhoneCountryCode ?? null,
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
```

Finally, guard `formatPeopleToRestoreFromContacts` so it doesn't call `getDomainNameFromHandle` on a phone number:

```typescript
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
```

- [ ] **Step 12: Add phone-handle test cases**

Add to `packages/zyra-server/src/modules/contact-creation-manager/services/__tests__/create-company-and-contact.service.spec.ts`, inside the existing `describe('computeContactsThatNeedPersonCreateAndRestoreAndWorkDomainNamesToCreate', ...)` block, after the existing `it('should identify contacts that need person restoration ...')` test:

```typescript
    it('should match an existing person by phone number for a phone-shaped handle', () => {
      const existingPersonByPhone = {
        id: 'person-whatsapp-1',
        phones: {
          primaryPhoneNumber: '5511999999999',
          additionalPhones: null,
        },
        deletedAt: null,
      } as unknown as PersonWorkspaceEntity;

      const result =
        service.computeContactsThatNeedPersonCreateAndRestoreAndWorkDomainNamesToCreate(
          [{ handle: '5511999999999', displayName: 'WhatsApp Contact' }],
          [existingPersonByPhone],
          FieldActorSource.WHATSAPP,
          mockConnectedAccount,
          null,
        );

      expect(result.contactsThatNeedPersonCreate).toHaveLength(0);
      expect(result.shouldCreateOrRestorePeopleByHandleMap.get('5511999999999'))
        .toEqual({ existingPerson: existingPersonByPhone });
    });

    it('should mark a phone-shaped handle with no existing match for person creation', () => {
      const result =
        service.computeContactsThatNeedPersonCreateAndRestoreAndWorkDomainNamesToCreate(
          [{ handle: '5511999999999', displayName: 'New WhatsApp Contact' }],
          [],
          FieldActorSource.WHATSAPP,
          mockConnectedAccount,
          null,
        );

      expect(result.contactsThatNeedPersonCreate).toHaveLength(1);
      expect(result.contactsThatNeedPersonCreate[0].handle).toBe(
        '5511999999999',
      );
      expect(result.workDomainNamesToCreate).toEqual([]);
    });

    it('should format a new person from a phone-shaped contact using phones, not emails', () => {
      const formatted = service.formatPeopleToCreateFromContacts({
        contactsToCreate: [
          { handle: '5511999999999', displayName: 'WhatsApp Contact' },
        ],
        createdBy: {
          source: FieldActorSource.WHATSAPP,
          context: { provider: mockConnectedAccount.provider },
        },
        companiesMap: {},
      });

      expect(formatted[0].emails).toBeUndefined();
      expect(formatted[0].phones).toEqual({
        primaryPhoneNumber: '999999999',
        primaryPhoneCallingCode: '+55',
        primaryPhoneCountryCode: 'BR',
        additionalPhones: null,
      });
    });
```

`FieldActorSource.WHATSAPP` must already exist — confirm with `grep -n "WHATSAPP" packages/zyra-shared/src/types/composite-types/actor.composite-type.ts` (already found during planning research: it does).

- [ ] **Step 13: Run the full spec file and verify it passes**

Run: `cd packages/zyra-server && npx jest create-company-and-contact.service --config=jest.config.mjs`
Expected: PASS, all tests including the 3 new ones.

- [ ] **Step 14: Typecheck and lint**

Run: `npx nx typecheck zyra-server`
Run: `npx nx lint:diff-with-main zyra-server`
Expected: no new errors.

- [ ] **Step 15: Commit**

```bash
git add packages/zyra-server/src/modules/match-participant packages/zyra-server/src/modules/contact-creation-manager
git commit -m "fix(server): contatos do WhatsApp passam a casar por telefone, nao email"
```

---

## Task 2: `sendWhatsappMessage` mutation

The existing `sendEmail` mutation goes through `EmailComposerService` (requires subject, sanitizes HTML, validates `to` as an email) — none of that applies to WhatsApp. Add a minimal, dedicated mutation that reuses the already-wired outbound driver and the existing message-persistence path.

**Files:**
- Create: `packages/zyra-server/src/modules/messaging/message-outbound-manager/dtos/send-whatsapp-message.input.ts`
- Create: `packages/zyra-server/src/modules/messaging/message-outbound-manager/dtos/send-whatsapp-message-output.dto.ts`
- Create: `packages/zyra-server/src/modules/messaging/message-outbound-manager/services/send-whatsapp-message.service.ts`
- Create: `packages/zyra-server/src/modules/messaging/message-outbound-manager/services/__tests__/send-whatsapp-message.service.spec.ts`
- Create: `packages/zyra-server/src/modules/messaging/message-outbound-manager/resolvers/send-whatsapp-message.resolver.ts`
- Modify: `packages/zyra-server/src/modules/messaging/message-outbound-manager/message-outbound-manager.module.ts` (register the new service + resolver — read this file first to match its existing provider list format)

**Interfaces:**
- Consumes: `MessagingMessageOutboundService.sendMessage(input: SendMessageInput, connectedAccount: ConnectedAccountEntity): Promise<SendMessageResult>` (existing, dispatches to `WhatsappMessageOutboundService` when `connectedAccount.provider === ConnectedAccountProvider.WHATSAPP`).
- Consumes: `SentMessagePersistenceService.persistSentMessage(input: PersistSentMessageInput): Promise<void>` (existing).
- Produces: `SendWhatsappMessageService.sendWhatsappMessage(input: { connectedAccountId: string; to: string; body: string }, workspace: WorkspaceEntity): Promise<{ success: boolean; error?: string }>` — consumed by Task 3.

- [ ] **Step 1: Write the failing test for the send service**

```typescript
// packages/zyra-server/src/modules/messaging/message-outbound-manager/services/__tests__/send-whatsapp-message.service.spec.ts
import { Test, type TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { ConnectedAccountProvider } from 'zyra-shared/types';

import { ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import { MessagingMessageOutboundService } from 'src/modules/messaging/message-outbound-manager/services/messaging-message-outbound.service';
import { SendWhatsappMessageService } from 'src/modules/messaging/message-outbound-manager/services/send-whatsapp-message.service';
import { SentMessagePersistenceService } from 'src/modules/messaging/message-outbound-manager/services/sent-message-persistence.service';
import { WhatsappChannelEntity } from 'src/engine/metadata-modules/whatsapp-channel/entities/whatsapp-channel.entity';

describe('SendWhatsappMessageService', () => {
  let service: SendWhatsappMessageService;
  let messagingMessageOutboundService: { sendMessage: jest.Mock };
  let sentMessagePersistenceService: { persistSentMessage: jest.Mock };
  let connectedAccountRepository: { findOne: jest.Mock };
  let whatsappChannelRepository: { findOne: jest.Mock };

  beforeEach(async () => {
    messagingMessageOutboundService = { sendMessage: jest.fn() };
    sentMessagePersistenceService = { persistSentMessage: jest.fn() };
    connectedAccountRepository = { findOne: jest.fn() };
    whatsappChannelRepository = { findOne: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SendWhatsappMessageService,
        {
          provide: MessagingMessageOutboundService,
          useValue: messagingMessageOutboundService,
        },
        {
          provide: SentMessagePersistenceService,
          useValue: sentMessagePersistenceService,
        },
        {
          provide: getRepositoryToken(ConnectedAccountEntity),
          useValue: connectedAccountRepository,
        },
        {
          provide: getRepositoryToken(WhatsappChannelEntity),
          useValue: whatsappChannelRepository,
        },
      ],
    }).compile();

    service = module.get<SendWhatsappMessageService>(SendWhatsappMessageService);
  });

  it('sends and persists the message, returning success', async () => {
    connectedAccountRepository.findOne.mockResolvedValue({
      id: 'connected-account-1',
      provider: ConnectedAccountProvider.WHATSAPP,
      handle: '5511000000000',
    });
    whatsappChannelRepository.findOne.mockResolvedValue({
      id: 'whatsapp-channel-1',
      messageChannelId: 'message-channel-1',
    });
    messagingMessageOutboundService.sendMessage.mockResolvedValue({
      headerMessageId: 'wamid.123',
      messageExternalId: 'wamid.123',
    });

    const result = await service.sendWhatsappMessage(
      { connectedAccountId: 'connected-account-1', to: '5511999999999', body: 'Oi!' },
      { id: 'workspace-1' } as never,
    );

    expect(result).toEqual({ success: true });
    expect(messagingMessageOutboundService.sendMessage).toHaveBeenCalledWith(
      expect.objectContaining({ to: '5511999999999', body: 'Oi!' }),
      expect.objectContaining({ id: 'connected-account-1' }),
    );
    expect(sentMessagePersistenceService.persistSentMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        body: 'Oi!',
        recipients: { to: ['5511999999999'], cc: [], bcc: [] },
        messageChannelId: 'message-channel-1',
        parentThreadExternalId: '5511999999999',
        workspaceId: 'workspace-1',
      }),
    );
  });

  it('returns a typed error when the outbound send fails (e.g. 24h window closed)', async () => {
    connectedAccountRepository.findOne.mockResolvedValue({
      id: 'connected-account-1',
      provider: ConnectedAccountProvider.WHATSAPP,
      handle: '5511000000000',
    });
    whatsappChannelRepository.findOne.mockResolvedValue({
      id: 'whatsapp-channel-1',
      messageChannelId: 'message-channel-1',
    });
    messagingMessageOutboundService.sendMessage.mockRejectedValue(
      new Error('Re-engagement message outside allowed window'),
    );

    const result = await service.sendWhatsappMessage(
      { connectedAccountId: 'connected-account-1', to: '5511999999999', body: 'Oi!' },
      { id: 'workspace-1' } as never,
    );

    expect(result).toEqual({
      success: false,
      error: 'Re-engagement message outside allowed window',
    });
    expect(sentMessagePersistenceService.persistSentMessage).not.toHaveBeenCalled();
  });

  it('returns a typed error when the connected account is not found in the workspace', async () => {
    connectedAccountRepository.findOne.mockResolvedValue(null);

    const result = await service.sendWhatsappMessage(
      { connectedAccountId: 'missing', to: '5511999999999', body: 'Oi!' },
      { id: 'workspace-1' } as never,
    );

    expect(result).toEqual({
      success: false,
      error: 'Connected account not found',
    });
    expect(messagingMessageOutboundService.sendMessage).not.toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `cd packages/zyra-server && npx jest send-whatsapp-message.service --config=jest.config.mjs`
Expected: FAIL — `SendWhatsappMessageService` module not found.

- [ ] **Step 3: Implement the DTOs**

```typescript
// packages/zyra-server/src/modules/messaging/message-outbound-manager/dtos/send-whatsapp-message.input.ts
import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class SendWhatsappMessageInput {
  @Field(() => String)
  connectedAccountId: string;

  @Field(() => String)
  to: string;

  @Field(() => String)
  body: string;
}
```

```typescript
// packages/zyra-server/src/modules/messaging/message-outbound-manager/dtos/send-whatsapp-message-output.dto.ts
import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType('SendWhatsappMessageOutput')
export class SendWhatsappMessageOutputDTO {
  @Field(() => Boolean)
  success: boolean;

  @Field(() => String, { nullable: true })
  error?: string;
}
```

- [ ] **Step 4: Implement `SendWhatsappMessageService`**

```typescript
// packages/zyra-server/src/modules/messaging/message-outbound-manager/services/send-whatsapp-message.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';
import { isDefined } from 'zyra-shared/utils';

import { ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import { type WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { WhatsappChannelEntity } from 'src/engine/metadata-modules/whatsapp-channel/entities/whatsapp-channel.entity';
import { MessagingMessageOutboundService } from 'src/modules/messaging/message-outbound-manager/services/messaging-message-outbound.service';
import { SentMessagePersistenceService } from 'src/modules/messaging/message-outbound-manager/services/sent-message-persistence.service';

export type SendWhatsappMessageParams = {
  connectedAccountId: string;
  to: string;
  body: string;
};

export type SendWhatsappMessageResult = {
  success: boolean;
  error?: string;
};

@Injectable()
export class SendWhatsappMessageService {
  private readonly logger = new Logger(SendWhatsappMessageService.name);

  constructor(
    private readonly messagingMessageOutboundService: MessagingMessageOutboundService,
    private readonly sentMessagePersistenceService: SentMessagePersistenceService,
    @InjectRepository(ConnectedAccountEntity)
    private readonly connectedAccountRepository: Repository<ConnectedAccountEntity>,
    @InjectRepository(WhatsappChannelEntity)
    private readonly whatsappChannelRepository: Repository<WhatsappChannelEntity>,
  ) {}

  async sendWhatsappMessage(
    params: SendWhatsappMessageParams,
    workspace: Pick<WorkspaceEntity, 'id'>,
  ): Promise<SendWhatsappMessageResult> {
    const connectedAccount = await this.connectedAccountRepository.findOne({
      where: { id: params.connectedAccountId, workspaceId: workspace.id },
    });

    if (!isDefined(connectedAccount)) {
      return { success: false, error: 'Connected account not found' };
    }

    const whatsappChannel = await this.whatsappChannelRepository.findOne({
      where: {
        connectedAccountId: connectedAccount.id,
        workspaceId: workspace.id,
      },
    });

    if (!isDefined(whatsappChannel)) {
      return { success: false, error: 'WhatsApp channel not found' };
    }

    try {
      const sendResult = await this.messagingMessageOutboundService.sendMessage(
        {
          to: params.to,
          body: params.body,
          subject: '',
          html: '',
          threadExternalId: params.to,
        },
        connectedAccount,
      );

      await this.sentMessagePersistenceService.persistSentMessage({
        sendResult,
        subject: '',
        body: params.body,
        recipients: { to: [params.to], cc: [], bcc: [] },
        connectedAccount,
        messageChannelId: whatsappChannel.messageChannelId,
        parentThreadExternalId: params.to,
        workspaceId: workspace.id,
      });

      return { success: true };
    } catch (error) {
      this.logger.warn(`Failed to send WhatsApp message: ${error}`);

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to send message',
      };
    }
  }
}
```

- [ ] **Step 5: Run the test to verify it passes**

Run: `cd packages/zyra-server && npx jest send-whatsapp-message.service --config=jest.config.mjs`
Expected: PASS (3 tests)

- [ ] **Step 6: Implement the resolver**

```typescript
// packages/zyra-server/src/modules/messaging/message-outbound-manager/resolvers/send-whatsapp-message.resolver.ts
import { UseFilters, UseGuards } from '@nestjs/common';
import { Args, Mutation } from '@nestjs/graphql';

import { PermissionFlagType } from 'zyra-shared/constants';

import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { AuthGraphqlApiExceptionFilter } from 'src/engine/core-modules/auth/filters/auth-graphql-api-exception.filter';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { SettingsPermissionGuard } from 'src/engine/guards/settings-permission.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { SendWhatsappMessageOutputDTO } from 'src/modules/messaging/message-outbound-manager/dtos/send-whatsapp-message-output.dto';
import { SendWhatsappMessageInput } from 'src/modules/messaging/message-outbound-manager/dtos/send-whatsapp-message.input';
import { SendWhatsappMessageService } from 'src/modules/messaging/message-outbound-manager/services/send-whatsapp-message.service';

@MetadataResolver()
@UseFilters(AuthGraphqlApiExceptionFilter)
@UseGuards(
  WorkspaceAuthGuard,
  SettingsPermissionGuard(PermissionFlagType.SEND_EMAIL_TOOL),
)
export class SendWhatsappMessageResolver {
  constructor(
    private readonly sendWhatsappMessageService: SendWhatsappMessageService,
  ) {}

  @Mutation(() => SendWhatsappMessageOutputDTO)
  async sendWhatsappMessage(
    @Args('input') input: SendWhatsappMessageInput,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<SendWhatsappMessageOutputDTO> {
    return this.sendWhatsappMessageService.sendWhatsappMessage(input, workspace);
  }
}
```

`PermissionFlagType.SEND_EMAIL_TOOL` is reused deliberately — it's the existing "can send outbound messages" permission flag (`SendEmailResolver` uses the same guard); do not introduce a new permission flag for this.

- [ ] **Step 7: Register the new service and resolver in the module**

Read `packages/zyra-server/src/modules/messaging/message-outbound-manager/message-outbound-manager.module.ts` first to see its exact current `providers`/`imports` arrays, then add `SendWhatsappMessageService` and `SendWhatsappMessageResolver` to `providers` (both need `ConnectedAccountEntity` and `WhatsappChannelEntity` available via `TypeOrmModule.forFeature` — add both to that module's `imports` if not already present; `MessagingMessageOutboundService` and `SentMessagePersistenceService` are already providers of this module per the existing `SendEmailService` usage).

- [ ] **Step 8: Typecheck and lint**

Run: `npx nx typecheck zyra-server`
Run: `npx nx lint:diff-with-main zyra-server`
Expected: no new errors.

- [ ] **Step 9: Commit**

```bash
git add packages/zyra-server/src/modules/messaging/message-outbound-manager
git commit -m "feat(server): mutation sendWhatsappMessage para responder pelo CRM"
```

---

## Task 3: Disable the AI agent when a human sends manually

After a manual `sendWhatsappMessage` succeeds, if a `WhatsappAgentConversationEntity` exists for that channel+contact, flip `isAiEnabled` to `false` — same behavior the agent itself already triggers on `wantsHumanHandoff`, just triggered by a human replying instead.

**Files:**
- Create: `packages/zyra-server/src/modules/whatsapp-agent/services/whatsapp-agent-manual-send-handoff.service.ts`
- Create: `packages/zyra-server/src/modules/whatsapp-agent/services/__tests__/whatsapp-agent-manual-send-handoff.service.spec.ts`
- Modify: `packages/zyra-server/src/modules/messaging/message-outbound-manager/services/send-whatsapp-message.service.ts` (call the new service after a successful send)
- Modify: `packages/zyra-server/src/modules/messaging/message-outbound-manager/services/__tests__/send-whatsapp-message.service.spec.ts` (add handoff assertion)
- Modify: `packages/zyra-server/src/modules/messaging/message-outbound-manager/message-outbound-manager.module.ts` (import `WhatsappAgentMetadataModule` for the new dependency, or wire the new service directly — see Step 5)

**Interfaces:**
- Produces: `WhatsappAgentManualSendHandoffService.disableAiIfConversationExists(params: { connectedAccountId: string; contactPhoneNumber: string; workspaceId: string }): Promise<void>`
- Consumes: `WhatsappChannelEntity` repository (`connectedAccountId` → `id`), `WhatsappAgentEntity` repository (`whatsappChannelId` → `id`, unique per channel), `WhatsappAgentConversationMetadataService.setAiEnabled` (existing, from Task-independent code already in the repo).

- [ ] **Step 1: Write the failing test**

```typescript
// packages/zyra-server/src/modules/whatsapp-agent/services/__tests__/whatsapp-agent-manual-send-handoff.service.spec.ts
import { Test, type TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { WhatsappAgentConversationMetadataService } from 'src/engine/metadata-modules/whatsapp-agent/whatsapp-agent-conversation-metadata.service';
import { WhatsappAgentEntity } from 'src/engine/metadata-modules/whatsapp-agent/entities/whatsapp-agent.entity';
import { WhatsappAgentConversationEntity } from 'src/engine/metadata-modules/whatsapp-agent/entities/whatsapp-agent-conversation.entity';
import { WhatsappChannelEntity } from 'src/engine/metadata-modules/whatsapp-channel/entities/whatsapp-channel.entity';
import { WhatsappAgentManualSendHandoffService } from 'src/modules/whatsapp-agent/services/whatsapp-agent-manual-send-handoff.service';

describe('WhatsappAgentManualSendHandoffService', () => {
  let service: WhatsappAgentManualSendHandoffService;
  let whatsappChannelRepository: { findOne: jest.Mock };
  let whatsappAgentRepository: { findOne: jest.Mock };
  let whatsappAgentConversationRepository: { findOne: jest.Mock };
  let whatsappAgentConversationMetadataService: { setAiEnabled: jest.Mock };

  beforeEach(async () => {
    whatsappChannelRepository = { findOne: jest.fn() };
    whatsappAgentRepository = { findOne: jest.fn() };
    whatsappAgentConversationRepository = { findOne: jest.fn() };
    whatsappAgentConversationMetadataService = { setAiEnabled: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WhatsappAgentManualSendHandoffService,
        {
          provide: getRepositoryToken(WhatsappChannelEntity),
          useValue: whatsappChannelRepository,
        },
        {
          provide: getRepositoryToken(WhatsappAgentEntity),
          useValue: whatsappAgentRepository,
        },
        {
          provide: getRepositoryToken(WhatsappAgentConversationEntity),
          useValue: whatsappAgentConversationRepository,
        },
        {
          provide: WhatsappAgentConversationMetadataService,
          useValue: whatsappAgentConversationMetadataService,
        },
      ],
    }).compile();

    service = module.get<WhatsappAgentManualSendHandoffService>(
      WhatsappAgentManualSendHandoffService,
    );
  });

  it('disables the AI when a matching agent conversation exists', async () => {
    whatsappChannelRepository.findOne.mockResolvedValue({ id: 'channel-1' });
    whatsappAgentRepository.findOne.mockResolvedValue({ id: 'agent-1' });
    whatsappAgentConversationRepository.findOne.mockResolvedValue({
      id: 'conversation-1',
    });

    await service.disableAiIfConversationExists({
      connectedAccountId: 'connected-account-1',
      contactPhoneNumber: '5511999999999',
      workspaceId: 'workspace-1',
    });

    expect(whatsappAgentConversationMetadataService.setAiEnabled).toHaveBeenCalledWith({
      id: 'conversation-1',
      isAiEnabled: false,
      workspaceId: 'workspace-1',
    });
  });

  it('does nothing when there is no WhatsApp channel for the connected account', async () => {
    whatsappChannelRepository.findOne.mockResolvedValue(null);

    await service.disableAiIfConversationExists({
      connectedAccountId: 'connected-account-1',
      contactPhoneNumber: '5511999999999',
      workspaceId: 'workspace-1',
    });

    expect(whatsappAgentConversationMetadataService.setAiEnabled).not.toHaveBeenCalled();
  });

  it('does nothing when there is no agent for the channel', async () => {
    whatsappChannelRepository.findOne.mockResolvedValue({ id: 'channel-1' });
    whatsappAgentRepository.findOne.mockResolvedValue(null);

    await service.disableAiIfConversationExists({
      connectedAccountId: 'connected-account-1',
      contactPhoneNumber: '5511999999999',
      workspaceId: 'workspace-1',
    });

    expect(whatsappAgentConversationMetadataService.setAiEnabled).not.toHaveBeenCalled();
  });

  it('does nothing when there is no conversation row yet for this contact', async () => {
    whatsappChannelRepository.findOne.mockResolvedValue({ id: 'channel-1' });
    whatsappAgentRepository.findOne.mockResolvedValue({ id: 'agent-1' });
    whatsappAgentConversationRepository.findOne.mockResolvedValue(null);

    await service.disableAiIfConversationExists({
      connectedAccountId: 'connected-account-1',
      contactPhoneNumber: '5511999999999',
      workspaceId: 'workspace-1',
    });

    expect(whatsappAgentConversationMetadataService.setAiEnabled).not.toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `cd packages/zyra-server && npx jest whatsapp-agent-manual-send-handoff --config=jest.config.mjs`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement `WhatsappAgentManualSendHandoffService`**

```typescript
// packages/zyra-server/src/modules/whatsapp-agent/services/whatsapp-agent-manual-send-handoff.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';
import { isDefined } from 'zyra-shared/utils';

import { WhatsappAgentConversationEntity } from 'src/engine/metadata-modules/whatsapp-agent/entities/whatsapp-agent-conversation.entity';
import { WhatsappAgentEntity } from 'src/engine/metadata-modules/whatsapp-agent/entities/whatsapp-agent.entity';
import { WhatsappAgentConversationMetadataService } from 'src/engine/metadata-modules/whatsapp-agent/whatsapp-agent-conversation-metadata.service';
import { WhatsappChannelEntity } from 'src/engine/metadata-modules/whatsapp-channel/entities/whatsapp-channel.entity';

export type DisableAiIfConversationExistsParams = {
  connectedAccountId: string;
  contactPhoneNumber: string;
  workspaceId: string;
};

@Injectable()
export class WhatsappAgentManualSendHandoffService {
  constructor(
    @InjectRepository(WhatsappChannelEntity)
    private readonly whatsappChannelRepository: Repository<WhatsappChannelEntity>,
    @InjectRepository(WhatsappAgentEntity)
    private readonly whatsappAgentRepository: Repository<WhatsappAgentEntity>,
    @InjectRepository(WhatsappAgentConversationEntity)
    private readonly whatsappAgentConversationRepository: Repository<WhatsappAgentConversationEntity>,
    private readonly whatsappAgentConversationMetadataService: WhatsappAgentConversationMetadataService,
  ) {}

  // A human just sent a WhatsApp message manually from the CRM — if the AI
  // agent is configured for this number and already has a conversation row
  // for this contact, stop it from replying over the human from here on.
  async disableAiIfConversationExists({
    connectedAccountId,
    contactPhoneNumber,
    workspaceId,
  }: DisableAiIfConversationExistsParams): Promise<void> {
    const whatsappChannel = await this.whatsappChannelRepository.findOne({
      where: { connectedAccountId, workspaceId },
    });

    if (!isDefined(whatsappChannel)) {
      return;
    }

    const whatsappAgent = await this.whatsappAgentRepository.findOne({
      where: { whatsappChannelId: whatsappChannel.id, workspaceId },
    });

    if (!isDefined(whatsappAgent)) {
      return;
    }

    const whatsappAgentConversation =
      await this.whatsappAgentConversationRepository.findOne({
        where: { whatsappAgentId: whatsappAgent.id, contactPhoneNumber, workspaceId },
      });

    if (!isDefined(whatsappAgentConversation)) {
      return;
    }

    await this.whatsappAgentConversationMetadataService.setAiEnabled({
      id: whatsappAgentConversation.id,
      isAiEnabled: false,
      workspaceId,
    });
  }
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `cd packages/zyra-server && npx jest whatsapp-agent-manual-send-handoff --config=jest.config.mjs`
Expected: PASS (4 tests)

- [ ] **Step 5: Wire it into `SendWhatsappMessageService`**

Open `packages/zyra-server/src/modules/messaging/message-outbound-manager/services/send-whatsapp-message.service.ts` (from Task 2). Add the import and constructor param:

```typescript
import { WhatsappAgentManualSendHandoffService } from 'src/modules/whatsapp-agent/services/whatsapp-agent-manual-send-handoff.service';
```

Add `private readonly whatsappAgentManualSendHandoffService: WhatsappAgentManualSendHandoffService,` to the constructor, and after the `await this.sentMessagePersistenceService.persistSentMessage(...)` call inside the `try` block, before `return { success: true };`, add:

```typescript
      await this.whatsappAgentManualSendHandoffService.disableAiIfConversationExists({
        connectedAccountId: connectedAccount.id,
        contactPhoneNumber: params.to,
        workspaceId: workspace.id,
      });
```

- [ ] **Step 6: Update the Task 2 send-whatsapp-message.service.spec.ts test to account for the new dependency**

In `packages/zyra-server/src/modules/messaging/message-outbound-manager/services/__tests__/send-whatsapp-message.service.spec.ts`, add a mock provider for `WhatsappAgentManualSendHandoffService` (`disableAiIfConversationExists: jest.fn()`) to the `Test.createTestingModule` providers array, and add this assertion to the first test (`'sends and persists the message, returning success'`):

```typescript
    expect(whatsappAgentManualSendHandoffService.disableAiIfConversationExists)
      .toHaveBeenCalledWith({
        connectedAccountId: 'connected-account-1',
        contactPhoneNumber: '5511999999999',
        workspaceId: 'workspace-1',
      });
```

(declare `let whatsappAgentManualSendHandoffService: { disableAiIfConversationExists: jest.Mock };` alongside the other mocks and assign it in `beforeEach`, same pattern as the other mocked dependencies).

- [ ] **Step 7: Run both spec files to verify they pass**

Run: `cd packages/zyra-server && npx jest whatsapp-agent-manual-send-handoff send-whatsapp-message.service --config=jest.config.mjs`
Expected: PASS (all tests in both files)

- [ ] **Step 8: Register `WhatsappAgentManualSendHandoffService` and its repositories**

`WhatsappAgentManualSendHandoffService` needs `WhatsappChannelEntity`, `WhatsappAgentEntity`, `WhatsappAgentConversationEntity` repositories and `WhatsappAgentConversationMetadataService`. Read `packages/zyra-server/src/modules/whatsapp-agent/whatsapp-agent.module.ts` (the runtime module, not `whatsapp-agent-metadata.module.ts`) to see its current imports/providers, then: add `WhatsappAgentManualSendHandoffService` to its `providers`, import `WhatsappAgentMetadataModule` (exports `WhatsappAgentConversationMetadataService` already, confirmed in that module's `exports` array) into its `imports`, and add `TypeOrmModule.forFeature([WhatsappChannelEntity, WhatsappAgentEntity, WhatsappAgentConversationEntity])` if those aren't already registered there. Then, in `message-outbound-manager.module.ts` (Task 2), import `WhatsappAgentModule` (or export `WhatsappAgentManualSendHandoffService` from it and import that) so `SendWhatsappMessageService` can inject it.

- [ ] **Step 9: Typecheck and lint**

Run: `npx nx typecheck zyra-server`
Run: `npx nx lint:diff-with-main zyra-server`
Expected: no new errors.

- [ ] **Step 10: Commit**

```bash
git add packages/zyra-server/src/modules/whatsapp-agent packages/zyra-server/src/modules/messaging/message-outbound-manager
git commit -m "feat(server): desliga a IA do whatsapp quando um humano responde manualmente"
```

---

## Task 4: WhatsApp conversation queries (person-scoped + workspace-wide)

Add a query to find "the WhatsApp thread id for this Person" (used by the record widget, Task 6) and a query to list all WhatsApp conversations workspace-wide (used by the global inbox, Task 7). Both need to filter `MessageThread`s down to ones whose channel is `MessageChannelType.WHATSAPP` — `TimelineMessagingService.getThreadVisibilityByThreadId` already shows the two-step pattern needed (thread→messageChannelId via raw query, then a separate `MessageChannelEntity` lookup by `type`), since `MessageChannelMessageAssociationWorkspaceEntity` only exposes `messageChannelId`, not a joinable relation to the channel's `type`.

**Files:**
- Create: `packages/zyra-server/src/modules/whatsapp-inbox/whatsapp-inbox.module.ts`
- Create: `packages/zyra-server/src/modules/whatsapp-inbox/dtos/whatsapp-conversation.dto.ts`
- Create: `packages/zyra-server/src/modules/whatsapp-inbox/services/whatsapp-inbox.service.ts`
- Create: `packages/zyra-server/src/modules/whatsapp-inbox/services/__tests__/whatsapp-inbox.service.spec.ts`
- Create: `packages/zyra-server/src/modules/whatsapp-inbox/resolvers/whatsapp-inbox.resolver.ts`
- Modify: `packages/zyra-server/src/engine/core-modules/messaging/messaging.module.ts` or wherever the app's root module list lives — read `packages/zyra-server/src/app.module.ts` first to find where sibling feature modules (e.g. `WhatsappAgentMetadataModule`) are imported, then add `WhatsappInboxModule` there.

**Interfaces:**
- Produces: `WhatsappInboxService.getThreadIdForPerson(personId: string, workspaceId: string): Promise<string | null>`
- Produces: `WhatsappInboxService.getConversations(workspaceId: string): Promise<WhatsappConversationDTO[]>`
- Produces GraphQL: `getWhatsappThreadIdForPerson(personId: UUID!): String`, `getWhatsappConversations: [WhatsappConversation!]!`

- [ ] **Step 1: Write the failing test for `WhatsappInboxService`**

```typescript
// packages/zyra-server/src/modules/whatsapp-inbox/services/__tests__/whatsapp-inbox.service.spec.ts
import { Test, type TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { MessageChannelType } from 'zyra-shared/types';

import { MessageChannelEntity } from 'src/engine/metadata-modules/message-channel/entities/message-channel.entity';
import { GlobalWorkspaceOrmManager } from 'src/engine/zyra-orm/global-workspace-datasource/global-workspace-orm.manager';
import { WhatsappInboxService } from 'src/modules/whatsapp-inbox/services/whatsapp-inbox.service';

describe('WhatsappInboxService', () => {
  let service: WhatsappInboxService;
  let messageChannelRepository: { find: jest.Mock };
  let globalWorkspaceOrmManager: {
    executeInWorkspaceContext: jest.Mock;
    getRepository: jest.Mock;
  };

  beforeEach(async () => {
    messageChannelRepository = { find: jest.fn() };
    globalWorkspaceOrmManager = {
      executeInWorkspaceContext: jest.fn((callback) => callback()),
      getRepository: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WhatsappInboxService,
        {
          provide: getRepositoryToken(MessageChannelEntity),
          useValue: messageChannelRepository,
        },
        {
          provide: GlobalWorkspaceOrmManager,
          useValue: globalWorkspaceOrmManager,
        },
      ],
    }).compile();

    service = module.get<WhatsappInboxService>(WhatsappInboxService);
  });

  describe('getThreadIdForPerson', () => {
    it('returns null when the person has no threads at all', async () => {
      const messageThreadRepository = {
        createQueryBuilder: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnThis(),
          addSelect: jest.fn().mockReturnThis(),
          innerJoin: jest.fn().mockReturnThis(),
          where: jest.fn().mockReturnThis(),
          groupBy: jest.fn().mockReturnThis(),
          orderBy: jest.fn().mockReturnThis(),
          getRawMany: jest.fn().mockResolvedValue([]),
        }),
      };

      globalWorkspaceOrmManager.getRepository.mockResolvedValue(
        messageThreadRepository,
      );

      const result = await service.getThreadIdForPerson(
        'person-1',
        'workspace-1',
      );

      expect(result).toBeNull();
    });

    it('returns the most recent thread id whose channel is WHATSAPP', async () => {
      const messageThreadRepository = {
        createQueryBuilder: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnThis(),
          addSelect: jest.fn().mockReturnThis(),
          innerJoin: jest.fn().mockReturnThis(),
          where: jest.fn().mockReturnThis(),
          groupBy: jest.fn().mockReturnThis(),
          orderBy: jest.fn().mockReturnThis(),
          getRawMany: jest.fn().mockResolvedValue([
            {
              messageThreadId: 'thread-email-1',
              messageChannelId: 'channel-email-1',
              lastMessageReceivedAt: new Date('2026-09-20'),
            },
            {
              messageThreadId: 'thread-whatsapp-1',
              messageChannelId: 'channel-whatsapp-1',
              lastMessageReceivedAt: new Date('2026-09-27'),
            },
          ]),
        }),
      };

      globalWorkspaceOrmManager.getRepository.mockResolvedValue(
        messageThreadRepository,
      );
      messageChannelRepository.find.mockResolvedValue([
        { id: 'channel-whatsapp-1', type: MessageChannelType.WHATSAPP },
        { id: 'channel-email-1', type: MessageChannelType.EMAIL },
      ]);

      const result = await service.getThreadIdForPerson(
        'person-1',
        'workspace-1',
      );

      expect(result).toBe('thread-whatsapp-1');
    });
  });
});
```

`MessageChannelType.EMAIL` must already exist — confirm with `grep -n "EMAIL" packages/zyra-shared/src/types/MessageChannelType.ts` before writing this test (the enum was already confirmed to contain `WHATSAPP` during planning; it almost certainly also has an `EMAIL` or `GMAIL`/`IMAP_SMTP_CALDAV`-style value — verify the exact name and adjust the test fixture accordingly).

- [ ] **Step 2: Run the test to verify it fails**

Run: `cd packages/zyra-server && npx jest whatsapp-inbox.service --config=jest.config.mjs`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement `WhatsappInboxService`**

```typescript
// packages/zyra-server/src/modules/whatsapp-inbox/services/whatsapp-inbox.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { In, Repository } from 'typeorm';
import { MessageChannelType } from 'zyra-shared/types';

import { MessageChannelEntity } from 'src/engine/metadata-modules/message-channel/entities/message-channel.entity';
import { GlobalWorkspaceOrmManager } from 'src/engine/zyra-orm/global-workspace-datasource/global-workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/zyra-orm/utils/build-system-auth-context.util';
import { type WhatsappConversationDTO } from 'src/modules/whatsapp-inbox/dtos/whatsapp-conversation.dto';

type ThreadChannelRow = {
  messageThreadId: string;
  messageChannelId: string | null;
  lastMessageReceivedAt: Date;
};

@Injectable()
export class WhatsappInboxService {
  constructor(
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
    @InjectRepository(MessageChannelEntity)
    private readonly messageChannelRepository: Repository<MessageChannelEntity>,
  ) {}

  private async getWhatsappMessageChannelIds(
    workspaceId: string,
  ): Promise<Set<string>> {
    const whatsappChannels = await this.messageChannelRepository.find({
      where: { workspaceId, type: MessageChannelType.WHATSAPP },
      select: { id: true },
    });

    return new Set(whatsappChannels.map((channel) => channel.id));
  }

  private async getThreadChannelRows(
    workspaceId: string,
    personIds?: string[],
  ): Promise<ThreadChannelRow[]> {
    const authContext = buildSystemAuthContext(workspaceId);

    return this.globalWorkspaceOrmManager.executeInWorkspaceContext(
      async () => {
        const messageThreadRepository =
          await this.globalWorkspaceOrmManager.getRepository(
            workspaceId,
            'messageThread',
          );

        let queryBuilder = messageThreadRepository
          .createQueryBuilder('messageThread')
          .select('messageThread.id', 'messageThreadId')
          .addSelect(
            'messageChannelMessageAssociation.messageChannelId',
            'messageChannelId',
          )
          .addSelect('MAX(messages.receivedAt)', 'lastMessageReceivedAt')
          .innerJoin('messageThread.messages', 'messages')
          .innerJoin(
            'messages.messageChannelMessageAssociations',
            'messageChannelMessageAssociation',
          );

        if (personIds && personIds.length > 0) {
          queryBuilder = queryBuilder
            .innerJoin('messages.messageParticipants', 'messageParticipants')
            .where('messageParticipants.personId IN (:...personIds)', {
              personIds,
            });
        }

        return queryBuilder
          .groupBy('messageThread.id')
          .addGroupBy('messageChannelMessageAssociation.messageChannelId')
          .orderBy('"lastMessageReceivedAt"', 'DESC')
          .getRawMany<ThreadChannelRow>();
      },
      authContext,
    );
  }

  async getThreadIdForPerson(
    personId: string,
    workspaceId: string,
  ): Promise<string | null> {
    const [threadRows, whatsappChannelIds] = await Promise.all([
      this.getThreadChannelRows(workspaceId, [personId]),
      this.getWhatsappMessageChannelIds(workspaceId),
    ]);

    const whatsappThreadRow = threadRows.find(
      (row) =>
        row.messageChannelId !== null &&
        whatsappChannelIds.has(row.messageChannelId),
    );

    return whatsappThreadRow?.messageThreadId ?? null;
  }

  async getConversations(workspaceId: string): Promise<WhatsappConversationDTO[]> {
    const [threadRows, whatsappChannelIds] = await Promise.all([
      this.getThreadChannelRows(workspaceId),
      this.getWhatsappMessageChannelIds(workspaceId),
    ]);

    const whatsappThreadRows = threadRows.filter(
      (row) =>
        row.messageChannelId !== null &&
        whatsappChannelIds.has(row.messageChannelId),
    );

    if (whatsappThreadRows.length === 0) {
      return [];
    }

    const authContext = buildSystemAuthContext(workspaceId);
    const threadIds = whatsappThreadRows.map((row) => row.messageThreadId);

    const lastMessagesByThreadId = await this.globalWorkspaceOrmManager.executeInWorkspaceContext(
      async () => {
        const messageRepository = await this.globalWorkspaceOrmManager.getRepository(
          workspaceId,
          'message',
        );

        const messages = await messageRepository.find({
          where: { messageThreadId: In(threadIds) },
          order: { receivedAt: 'DESC' },
          relations: { messageParticipants: true },
        });

        const byThreadId = new Map<string, (typeof messages)[number]>();

        for (const message of messages) {
          if (!byThreadId.has(message.messageThreadId as string)) {
            byThreadId.set(message.messageThreadId as string, message);
          }
        }

        return byThreadId;
      },
      authContext,
    );

    return whatsappThreadRows
      .map((row): WhatsappConversationDTO | null => {
        const lastMessage = lastMessagesByThreadId.get(row.messageThreadId);

        if (!lastMessage) {
          return null;
        }

        const fromParticipant = (
          lastMessage.messageParticipants as {
            role: string;
            handle: string | null;
            displayName: string | null;
            personId: string | null;
          }[]
        ).find((participant) => participant.role === 'from');

        return {
          messageThreadId: row.messageThreadId,
          contactPhoneNumber: fromParticipant?.handle ?? '',
          contactDisplayName: fromParticipant?.displayName ?? '',
          personId: fromParticipant?.personId ?? null,
          lastMessageBody: lastMessage.text ?? '',
          lastMessageReceivedAt: lastMessage.receivedAt ?? row.lastMessageReceivedAt,
        };
      })
      .filter((conversation): conversation is WhatsappConversationDTO =>
        conversation !== null,
      )
      .sort(
        (a, b) =>
          new Date(b.lastMessageReceivedAt).getTime() -
          new Date(a.lastMessageReceivedAt).getTime(),
      );
  }
}
```

`MessageParticipantRole.FROM` is an uppercase-ish enum per earlier usage (`MessageParticipantRole.FROM` was used, not the literal `'from'`) — replace the `.find((participant) => participant.role === 'from')` line with `.find((participant) => participant.role === MessageParticipantRole.FROM)` and import `MessageParticipantRole` from `'zyra-shared/types'`, matching the exact enum used throughout `TimelineMessagingService`.

- [ ] **Step 4: Implement the DTO**

```typescript
// packages/zyra-server/src/modules/whatsapp-inbox/dtos/whatsapp-conversation.dto.ts
import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType('WhatsappConversation')
export class WhatsappConversationDTO {
  @Field(() => String)
  messageThreadId: string;

  @Field(() => String)
  contactPhoneNumber: string;

  @Field(() => String)
  contactDisplayName: string;

  @Field(() => String, { nullable: true })
  personId: string | null;

  @Field(() => String)
  lastMessageBody: string;

  @Field(() => Date)
  lastMessageReceivedAt: Date;
}
```

- [ ] **Step 5: Run the test to verify it passes**

Run: `cd packages/zyra-server && npx jest whatsapp-inbox.service --config=jest.config.mjs`
Expected: PASS (2 tests)

- [ ] **Step 6: Implement the resolver**

```typescript
// packages/zyra-server/src/modules/whatsapp-inbox/resolvers/whatsapp-inbox.resolver.ts
import { UseGuards } from '@nestjs/common';
import { Args, Query } from '@nestjs/graphql';

import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { NoPermissionGuard } from 'src/engine/guards/no-permission.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { WhatsappConversationDTO } from 'src/modules/whatsapp-inbox/dtos/whatsapp-conversation.dto';
import { WhatsappInboxService } from 'src/modules/whatsapp-inbox/services/whatsapp-inbox.service';

@UseGuards(WorkspaceAuthGuard, NoPermissionGuard)
@MetadataResolver(() => WhatsappConversationDTO)
export class WhatsappInboxResolver {
  constructor(private readonly whatsappInboxService: WhatsappInboxService) {}

  @Query(() => String, { nullable: true })
  async getWhatsappThreadIdForPerson(
    @Args('personId', { type: () => UUIDScalarType }) personId: string,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<string | null> {
    return this.whatsappInboxService.getThreadIdForPerson(personId, workspace.id);
  }

  @Query(() => [WhatsappConversationDTO])
  async getWhatsappConversations(
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<WhatsappConversationDTO[]> {
    return this.whatsappInboxService.getConversations(workspace.id);
  }
}
```

- [ ] **Step 7: Register the module**

```typescript
// packages/zyra-server/src/modules/whatsapp-inbox/whatsapp-inbox.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { MessageChannelEntity } from 'src/engine/metadata-modules/message-channel/entities/message-channel.entity';
import { WhatsappInboxResolver } from 'src/modules/whatsapp-inbox/resolvers/whatsapp-inbox.resolver';
import { WhatsappInboxService } from 'src/modules/whatsapp-inbox/services/whatsapp-inbox.service';

@Module({
  imports: [TypeOrmModule.forFeature([MessageChannelEntity])],
  providers: [WhatsappInboxService, WhatsappInboxResolver],
})
export class WhatsappInboxModule {}
```

Read `packages/zyra-server/src/app.module.ts`, find where a sibling module like `WhatsappAgentMetadataModule` is imported, and add `WhatsappInboxModule` next to it the same way.

- [ ] **Step 8: Typecheck and lint**

Run: `npx nx typecheck zyra-server`
Run: `npx nx lint:diff-with-main zyra-server`
Expected: no new errors.

- [ ] **Step 9: Regenerate GraphQL types for the frontend**

Run: `npx nx run asturian-front:graphql:generate --configuration=metadata`

- [ ] **Step 10: Commit**

```bash
git add packages/zyra-server/src/modules/whatsapp-inbox packages/zyra-server/src/app.module.ts packages/asturian-front/src/generated-metadata
git commit -m "feat(server): queries pra listar conversas de whatsapp (por pessoa e globais)"
```

---

## Task 5: Register `WidgetType.WHATSAPP` as a configurable Person-page widget

Follow the exact same mechanism `EMAILS` already uses (`WidgetType` enum → per-type validators → `WidgetContentRenderer` case → default layout entry), confirmed during planning to be a thin, generic factory (`validateSimpleRecordPageWidgetForCreation`/`ForUpdate`) for every "just render a fixed panel" widget type — no bespoke validation logic needed.

**Files:**
- Modify: `packages/zyra-server/src/engine/metadata-modules/page-layout-widget/enums/widget-type.enum.ts`
- Modify: `packages/zyra-server/src/engine/metadata-modules/page-layout-widget/enums/widget-configuration-type.type.ts`
- Modify: `packages/zyra-server/src/engine/metadata-modules/flat-page-layout-widget/services/flat-page-layout-widget-type-validator.service.ts`
- Modify: `packages/zyra-shared/src/types/page-layout/page-layout-widget-configuration.type.ts`
- Modify: `packages/asturian-front/src/modules/page-layout/widgets/components/WidgetContentRenderer.tsx`
- Modify: `packages/asturian-front/src/modules/page-layout/utils/getWidgetTitle.ts`
- Modify: `packages/asturian-front/src/modules/page-layout/constants/DefaultPersonRecordPageLayout.ts`
- Create: `packages/asturian-front/src/modules/page-layout/widgets/whatsapp/components/WhatsappWidget.tsx`

**Interfaces:**
- Consumes: `WhatsappCard` component from Task 6 (`@/activities/whatsapp/components/WhatsappCard`).
- Produces: `WidgetType.WHATSAPP` usable anywhere `WidgetType` is switched on.

- [ ] **Step 1: Add the enum values (backend)**

In `packages/zyra-server/src/engine/metadata-modules/page-layout-widget/enums/widget-type.enum.ts`, add `WHATSAPP = 'WHATSAPP',` after the `EMAILS = 'EMAILS',` line.

In `packages/zyra-server/src/engine/metadata-modules/page-layout-widget/enums/widget-configuration-type.type.ts`, add `WHATSAPP = 'WHATSAPP',` after the `EMAILS = 'EMAILS',` line (inside `export enum WidgetConfigurationType`).

- [ ] **Step 2: Register the generic validators**

In `packages/zyra-server/src/engine/metadata-modules/flat-page-layout-widget/services/flat-page-layout-widget-type-validator.service.ts`, in `PAGE_LAYOUT_WIDGET_TYPE_VALIDATOR_FOR_CREATION_HASHMAP`, add after the `EMAILS: ...` entry:

```typescript
      WHATSAPP: validateSimpleRecordPageWidgetForCreation(
        WidgetConfigurationType.WHATSAPP,
      ),
```

In `PAGE_LAYOUT_WIDGET_TYPE_VALIDATOR_FOR_UPDATE_HASHMAP`, add after the `EMAILS: ...` entry:

```typescript
      WHATSAPP: validateSimpleRecordPageWidgetForUpdate(
        WidgetConfigurationType.WHATSAPP,
      ),
```

- [ ] **Step 3: Typecheck the backend to catch every place the new enum member needs a case**

Run: `npx nx typecheck zyra-server`
Expected: TypeScript errors pointing at every remaining exhaustive `switch`/hashmap over `WidgetType`/`WidgetConfigurationType` that doesn't yet handle `WHATSAPP`. Fix each one by adding a `WHATSAPP` case that mirrors its nearest simple-panel sibling (`EMAILS`, `TIMELINE`, `CALENDAR`, etc. — do not invent new behavior, just add the missing switch arm). Re-run until clean.

- [ ] **Step 4: Add the shared configuration type (frontend/shared)**

In `packages/zyra-shared/src/types/page-layout/page-layout-widget-configuration.type.ts`, add after the `EmailsConfiguration` type (around line 148-150):

```typescript
export type WhatsappConfiguration = {
  configurationType: 'WHATSAPP';
};
```

Find the union type that combines all the `*Configuration` types in this same file (e.g. `export type WidgetConfiguration = ... | EmailsConfiguration | ...`) and add `| WhatsappConfiguration` to it.

- [ ] **Step 5: Add the `getWidgetTitle` case (frontend)**

In `packages/asturian-front/src/modules/page-layout/utils/getWidgetTitle.ts`, add a new `case WidgetConfigurationType.WHATSAPP:` arm returning `` `${t`WhatsApp`} ${index + 1}` ``, placed before `case WidgetConfigurationType.IFRAME:` (following the same pattern as the other named-return cases, not the grouped fall-through cases at the bottom).

- [ ] **Step 6: Build `WhatsappWidget` and register it in the renderer (frontend)**

```typescript
// packages/asturian-front/src/modules/page-layout/widgets/whatsapp/components/WhatsappWidget.tsx
import { WhatsappCard } from '@/activities/whatsapp/components/WhatsappCard';
import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';

type WhatsappWidgetProps = {
  widget: PageLayoutWidget;
};

// widget is unused today (no per-widget configuration beyond its type), kept
// for parity with every other widget renderer's props contract.
export const WhatsappWidget = (_props: WhatsappWidgetProps) => {
  return <WhatsappCard />;
};
```

In `packages/asturian-front/src/modules/page-layout/widgets/components/WidgetContentRenderer.tsx`, add the import:

```typescript
import { WhatsappWidget } from '@/page-layout/widgets/whatsapp/components/WhatsappWidget';
```

And add, after the `case WidgetType.EMAILS:` arm:

```typescript
    case WidgetType.WHATSAPP:
      return <WhatsappWidget widget={widget} />;
```

- [ ] **Step 7: Add the tab to the default Person layout (frontend)**

In `packages/asturian-front/src/modules/page-layout/constants/DefaultPersonRecordPageLayout.ts`, duplicate the `person-tab-emails` tab block (lines ~247-283, the full object from `{ __typename: 'PageLayoutTab', ... id: 'person-tab-emails', ... }` through its closing `},`) into a new tab immediately after it, with these fields changed: `id: 'person-tab-whatsapp'`, `title: 'WhatsApp'`, `icon: 'IconBrandWhatsapp'` (confirm this icon name exists in `zyra-ui/icon`'s `TablerIcons.ts`; if not, use `'IconMessage'` instead), `position: 700` (the next multiple of 100 after Emails' `600`), `pageLayoutTabId: 'person-tab-whatsapp'` on its widget, widget `id: 'person-widget-whatsapp'`, widget `title: 'WhatsApp'`, widget `type: WidgetType.WHATSAPP`, and the widget's `configuration.configurationType: WidgetConfigurationType.WHATSAPP` (mirroring whatever the Emails widget's `configuration` block already contains structurally).

This only seeds the tab for brand-new workspaces/layouts. Existing workspaces get the widget too, but the user (or an admin) adds the "WhatsApp" tab manually via the page layout editor's "Add tab" → "Add widget" flow — the same flow already used for every other optional widget type; no data migration is needed since `PageLayoutWidget.type` is not a Postgres-level constrained column.

- [ ] **Step 8: Typecheck and lint both projects**

Run: `npx nx typecheck zyra-server`
Run: `npx nx typecheck asturian-front`
Run: `npx nx lint:diff-with-main zyra-server`
Run: `npx nx lint:diff-with-main asturian-front`
Expected: no new errors (Task 6 has not created `WhatsappCard` yet, so this step will fail on the missing import — acceptable to leave `WhatsappWidget.tsx`'s import unresolved until Task 6 lands; if executing tasks out of order, come back to typecheck after Task 6).

- [ ] **Step 9: Commit**

```bash
git add packages/zyra-server/src/engine/metadata-modules/page-layout-widget packages/zyra-server/src/engine/metadata-modules/flat-page-layout-widget packages/zyra-shared/src/types/page-layout packages/asturian-front/src/modules/page-layout
git commit -m "feat: registra WHATSAPP como tipo de widget configuravel na pagina de Person"
```

---

## Task 6: `WhatsappCard` — the chat UI

The actual chat rendering + reply box, consumed by `WhatsappWidget` (Task 5). Mirrors `useEmailThread`/`useSendEmail` from `modules/activities/emails`, but simpler: no HTML, no subject, no attachments, no CC/BCC.

**Files:**
- Create: `packages/asturian-front/src/modules/activities/whatsapp/types/WhatsappThreadMessage.ts`
- Create: `packages/asturian-front/src/modules/activities/whatsapp/graphql/queries/getWhatsappThreadIdForPerson.ts`
- Create: `packages/asturian-front/src/modules/activities/whatsapp/graphql/mutations/sendWhatsappMessage.ts`
- Create: `packages/asturian-front/src/modules/activities/whatsapp/hooks/useWhatsappThreadForPerson.ts`
- Create: `packages/asturian-front/src/modules/activities/whatsapp/hooks/useSendWhatsappMessage.ts`
- Create: `packages/asturian-front/src/modules/activities/whatsapp/hooks/__tests__/useSendWhatsappMessage.test.tsx`
- Create: `packages/asturian-front/src/modules/activities/whatsapp/components/WhatsappMessageBubble.tsx`
- Create: `packages/asturian-front/src/modules/activities/whatsapp/components/WhatsappCard.tsx`
- Create: `packages/asturian-front/src/modules/activities/whatsapp/components/__tests__/WhatsappCard.test.tsx`

**Interfaces:**
- Consumes: `fetchAllThreadMessagesOperationSignatureFactory({ messageThreadId })` (existing, generic — not email-specific despite its module location) from `@/activities/emails/graphql/operation-signatures/factories/fetchAllThreadMessagesOperationSignatureFactory`.
- Consumes: `useTargetRecord()` (existing, from `@/ui/layout/contexts/useTargetRecord`) to get the current Person's id.
- Produces: `WhatsappCard` (default export-free, named export), rendered with no props (reads the target record from context).

- [ ] **Step 1: Define the message type**

```typescript
// packages/asturian-front/src/modules/activities/whatsapp/types/WhatsappThreadMessage.ts
export type WhatsappThreadMessage = {
  id: string;
  text: string | null;
  receivedAt: string | null;
  createdAt: string;
};
```

- [ ] **Step 2: Add the GraphQL query and mutation documents**

```typescript
// packages/asturian-front/src/modules/activities/whatsapp/graphql/queries/getWhatsappThreadIdForPerson.ts
import { gql } from '@apollo/client';

export const GET_WHATSAPP_THREAD_ID_FOR_PERSON = gql`
  query GetWhatsappThreadIdForPerson($personId: UUID!) {
    getWhatsappThreadIdForPerson(personId: $personId)
  }
`;
```

```typescript
// packages/asturian-front/src/modules/activities/whatsapp/graphql/mutations/sendWhatsappMessage.ts
import { gql } from '@apollo/client';

export const SEND_WHATSAPP_MESSAGE = gql`
  mutation SendWhatsappMessage($input: SendWhatsappMessageInput!) {
    sendWhatsappMessage(input: $input) {
      success
      error
    }
  }
`;
```

- [ ] **Step 3: Build `useWhatsappThreadForPerson`**

```typescript
// packages/asturian-front/src/modules/activities/whatsapp/hooks/useWhatsappThreadForPerson.ts
import { fetchAllThreadMessagesOperationSignatureFactory } from '@/activities/emails/graphql/operation-signatures/factories/fetchAllThreadMessagesOperationSignatureFactory';
import { GET_WHATSAPP_THREAD_ID_FOR_PERSON } from '@/activities/whatsapp/graphql/queries/getWhatsappThreadIdForPerson';
import { type WhatsappThreadMessage } from '@/activities/whatsapp/types/WhatsappThreadMessage';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { useQuery } from '@apollo/client/react';

export const useWhatsappThreadForPerson = (personId: string) => {
  const apolloCoreClient = useApolloCoreClient();

  const { data, loading: threadIdLoading } = useQuery<{
    getWhatsappThreadIdForPerson: string | null;
  }>(GET_WHATSAPP_THREAD_ID_FOR_PERSON, {
    client: apolloCoreClient,
    variables: { personId },
    skip: !personId,
  });

  const messageThreadId = data?.getWhatsappThreadIdForPerson ?? null;

  const OPERATION_SIGNATURE = fetchAllThreadMessagesOperationSignatureFactory({
    messageThreadId,
  });

  const { records: messages, loading: messagesLoading } =
    useFindManyRecords<WhatsappThreadMessage>({
      limit: OPERATION_SIGNATURE.variables.limit,
      filter: OPERATION_SIGNATURE.variables.filter,
      objectNameSingular: OPERATION_SIGNATURE.objectNameSingular,
      orderBy: OPERATION_SIGNATURE.variables.orderBy,
      recordGqlFields: { id: true, text: true, receivedAt: true, createdAt: true },
      skip: !messageThreadId,
    });

  return {
    messageThreadId,
    messages,
    loading: threadIdLoading || messagesLoading,
  };
};
```

- [ ] **Step 4: Write the failing test for `useSendWhatsappMessage`**

```tsx
// packages/asturian-front/src/modules/activities/whatsapp/hooks/__tests__/useSendWhatsappMessage.test.tsx
import { MockedProvider } from '@apollo/client/testing';
import { renderHook, waitFor } from '@testing-library/react';

import { SEND_WHATSAPP_MESSAGE } from '@/activities/whatsapp/graphql/mutations/sendWhatsappMessage';
import { useSendWhatsappMessage } from '@/activities/whatsapp/hooks/useSendWhatsappMessage';

jest.mock('@/object-metadata/hooks/useApolloCoreClient', () => ({
  useApolloCoreClient: () => undefined,
}));

jest.mock('@/ui/feedback/snack-bar-manager/hooks/useSnackBar', () => ({
  useSnackBar: () => ({
    enqueueSuccessSnackBar: jest.fn(),
    enqueueErrorSnackBar: jest.fn(),
  }),
}));

const mocks = [
  {
    request: {
      query: SEND_WHATSAPP_MESSAGE,
      variables: {
        input: {
          connectedAccountId: 'connected-account-1',
          to: '5511999999999',
          body: 'Oi!',
        },
      },
    },
    result: {
      data: { sendWhatsappMessage: { success: true, error: null } },
    },
  },
];

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <MockedProvider mocks={mocks} addTypename={false}>
    {children}
  </MockedProvider>
);

describe('useSendWhatsappMessage', () => {
  it('sends the message and reports success', async () => {
    const { result } = renderHook(() => useSendWhatsappMessage(), {
      wrapper: Wrapper,
    });

    const success = await result.current.sendWhatsappMessage({
      connectedAccountId: 'connected-account-1',
      to: '5511999999999',
      body: 'Oi!',
    });

    await waitFor(() => expect(success).toBe(true));
  });
});
```

- [ ] **Step 5: Run the test to verify it fails**

Run: `cd packages/asturian-front && npx jest useSendWhatsappMessage --config=jest.config.mjs`
Expected: FAIL — `useSendWhatsappMessage` module not found.

- [ ] **Step 6: Implement `useSendWhatsappMessage`**

```typescript
// packages/asturian-front/src/modules/activities/whatsapp/hooks/useSendWhatsappMessage.ts
import { useMutation } from '@apollo/client/react';
import { useCallback } from 'react';

import { GET_WHATSAPP_THREAD_ID_FOR_PERSON } from '@/activities/whatsapp/graphql/queries/getWhatsappThreadIdForPerson';
import { SEND_WHATSAPP_MESSAGE } from '@/activities/whatsapp/graphql/mutations/sendWhatsappMessage';
import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { t } from '@lingui/core/macro';
import {
  type SendWhatsappMessageMutation,
  type SendWhatsappMessageMutationVariables,
} from '~/generated-metadata/graphql';

type SendWhatsappMessageParams = {
  connectedAccountId: string;
  to: string;
  body: string;
};

export const useSendWhatsappMessage = () => {
  const apolloCoreClient = useApolloCoreClient();

  const [sendWhatsappMessageMutation, { loading }] = useMutation<
    SendWhatsappMessageMutation,
    SendWhatsappMessageMutationVariables
  >(SEND_WHATSAPP_MESSAGE);

  const { enqueueSuccessSnackBar, enqueueErrorSnackBar } = useSnackBar();

  const sendWhatsappMessage = useCallback(
    async (params: SendWhatsappMessageParams): Promise<boolean> => {
      try {
        const result = await sendWhatsappMessageMutation({
          variables: { input: params },
        });

        if (result.data?.sendWhatsappMessage.success) {
          enqueueSuccessSnackBar({ message: t`Message sent` });

          await apolloCoreClient.refetchQueries({
            include: [
              GET_WHATSAPP_THREAD_ID_FOR_PERSON,
              'FindManyMessages',
              'GetWhatsappConversations',
            ],
          });

          return true;
        }

        enqueueErrorSnackBar({
          message:
            result.data?.sendWhatsappMessage.error ?? t`Failed to send message`,
        });

        return false;
      } catch {
        enqueueErrorSnackBar({ message: t`Failed to send message` });

        return false;
      }
    },
    [
      sendWhatsappMessageMutation,
      enqueueSuccessSnackBar,
      enqueueErrorSnackBar,
      apolloCoreClient,
    ],
  );

  return { sendWhatsappMessage, loading };
};
```

- [ ] **Step 7: Run the test to verify it passes**

Run: `cd packages/asturian-front && npx jest useSendWhatsappMessage --config=jest.config.mjs`
Expected: PASS

- [ ] **Step 8: Build the message bubble component**

```tsx
// packages/asturian-front/src/modules/activities/whatsapp/components/WhatsappMessageBubble.tsx
import { styled } from '@linaria/react';
import { themeCssVariables } from 'zyra-ui/theme-constants';

import { type WhatsappThreadMessage } from '@/activities/whatsapp/types/WhatsappThreadMessage';

const StyledBubble = styled.div<{ isOutgoing: boolean }>`
  align-self: ${({ isOutgoing }) => (isOutgoing ? 'flex-end' : 'flex-start')};
  background: ${({ isOutgoing }) =>
    isOutgoing
      ? themeCssVariables.color.blue
      : themeCssVariables.background.tertiary};
  border-radius: ${themeCssVariables.border.radius.md};
  color: ${({ isOutgoing }) =>
    isOutgoing ? themeCssVariables.font.color.inverted : themeCssVariables.font.color.primary};
  max-width: 70%;
  padding: ${themeCssVariables.spacing[2]} ${themeCssVariables.spacing[3]};
`;

const StyledTimestamp = styled.span`
  color: ${themeCssVariables.font.color.tertiary};
  display: block;
  font-size: ${themeCssVariables.font.size.xs};
  margin-top: ${themeCssVariables.spacing[1]};
`;

type WhatsappMessageBubbleProps = {
  message: WhatsappThreadMessage;
  isOutgoing: boolean;
};

export const WhatsappMessageBubble = ({
  message,
  isOutgoing,
}: WhatsappMessageBubbleProps) => {
  const timestamp = message.receivedAt ?? message.createdAt;

  return (
    <StyledBubble isOutgoing={isOutgoing}>
      {message.text}
      <StyledTimestamp>{new Date(timestamp).toLocaleString()}</StyledTimestamp>
    </StyledBubble>
  );
};
```

Read `zyra-ui/theme-constants`'s exported `themeCssVariables` shape before finalizing the token names above (`color.blue`, `background.tertiary`, `font.color.inverted`/`primary`/`tertiary`, `border.radius.md`, `spacing[n]`, `font.size.xs`) — adjust any that don't exist to their nearest real equivalent already used elsewhere in `zyra-ui` (e.g. grep for `themeCssVariables.font.color` usages in an existing component like `EmailThreadMessage.tsx` for the exact available token names).

- [ ] **Step 9: Write the failing test for `WhatsappCard`**

```tsx
// packages/asturian-front/src/modules/activities/whatsapp/components/__tests__/WhatsappCard.test.tsx
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { WhatsappCard } from '@/activities/whatsapp/components/WhatsappCard';
import { renderWithProviders } from '~/testing/utils/renderWithProviders';

jest.mock('@/ui/layout/contexts/useTargetRecord', () => ({
  useTargetRecord: () => ({ id: 'person-1', targetObjectNameSingular: 'person' }),
}));

const mockSendWhatsappMessage = jest.fn().mockResolvedValue(true);

jest.mock('@/activities/whatsapp/hooks/useWhatsappThreadForPerson', () => ({
  useWhatsappThreadForPerson: () => ({
    messageThreadId: 'thread-1',
    messages: [
      { id: 'message-1', text: 'Oi, tudo bem?', receivedAt: '2026-09-28T10:00:00Z', createdAt: '2026-09-28T10:00:00Z' },
    ],
    loading: false,
  }),
}));

jest.mock('@/activities/whatsapp/hooks/useSendWhatsappMessage', () => ({
  useSendWhatsappMessage: () => ({
    sendWhatsappMessage: mockSendWhatsappMessage,
    loading: false,
  }),
}));

describe('WhatsappCard', () => {
  it('shows the conversation and sends a reply when the user submits the reply box', async () => {
    const user = userEvent.setup();

    renderWithProviders(<WhatsappCard />);

    expect(await screen.findByText('Oi, tudo bem?')).toBeVisible();

    await user.type(screen.getByRole('textbox'), 'Tudo sim!');
    await user.click(screen.getByRole('button', { name: /enviar/i }));

    expect(mockSendWhatsappMessage).toHaveBeenCalledWith(
      expect.objectContaining({ to: expect.any(String), body: 'Tudo sim!' }),
    );
  });
});
```

Check whether `~/testing/utils/renderWithProviders` exists under that exact path in `asturian-front` (grep for `renderWithProviders` under `packages/asturian-front/src/testing`); if the actual helper has a different name/path, use that instead — do not invent a new test-rendering helper.

- [ ] **Step 10: Run the test to verify it fails**

Run: `cd packages/asturian-front && npx jest WhatsappCard --config=jest.config.mjs`
Expected: FAIL — `WhatsappCard` module not found.

- [ ] **Step 11: Implement `WhatsappCard`**

```tsx
// packages/asturian-front/src/modules/activities/whatsapp/components/WhatsappCard.tsx
import { useState } from 'react';

import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { Button } from 'zyra-ui/input';
import { Section } from 'zyra-ui/layout';
import { H1Title, H1TitleFontColor } from 'zyra-ui/typography';
import { themeCssVariables } from 'zyra-ui/theme-constants';

import { WhatsappMessageBubble } from '@/activities/whatsapp/components/WhatsappMessageBubble';
import { useSendWhatsappMessage } from '@/activities/whatsapp/hooks/useSendWhatsappMessage';
import { useWhatsappThreadForPerson } from '@/activities/whatsapp/hooks/useWhatsappThreadForPerson';
import { useMyWhatsappChannels } from '@/settings/accounts/hooks/useMyWhatsappChannels';
import { SettingsEmptyPlaceholder } from '@/settings/components/SettingsEmptyPlaceholder';
import { useTargetRecord } from '@/ui/layout/contexts/useTargetRecord';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  padding: ${themeCssVariables.spacing[6]};
`;

const StyledMessageList = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
  overflow-y: auto;
`;

const StyledReplyRow = styled.form`
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  margin-top: ${themeCssVariables.spacing[4]};
`;

const StyledReplyInput = styled.input`
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.sm};
  flex: 1;
  padding: ${themeCssVariables.spacing[2]};
`;

export const WhatsappCard = () => {
  const { t } = useLingui();
  const targetRecord = useTargetRecord();
  const { messages, loading } = useWhatsappThreadForPerson(targetRecord.id);
  const { sendWhatsappMessage, loading: sending } = useSendWhatsappMessage();
  const { channels } = useMyWhatsappChannels();
  const [draft, setDraft] = useState('');

  const contactPhoneNumber = messages[0] ? targetRecord.id : null;
  const connectedAccountId = channels[0]?.connectedAccountId;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (draft.trim().length === 0 || !connectedAccountId || !contactPhoneNumber) {
      return;
    }

    const wasSent = await sendWhatsappMessage({
      connectedAccountId,
      to: contactPhoneNumber,
      body: draft.trim(),
    });

    if (wasSent) {
      setDraft('');
    }
  };

  if (loading) {
    return <SettingsEmptyPlaceholder>{t`Loading conversation...`}</SettingsEmptyPlaceholder>;
  }

  if (messages.length === 0) {
    return <SettingsEmptyPlaceholder>{t`No WhatsApp conversation yet`}</SettingsEmptyPlaceholder>;
  }

  return (
    <StyledContainer>
      <Section>
        <H1Title title={t`WhatsApp`} fontColor={H1TitleFontColor.Primary} />
      </Section>
      <StyledMessageList>
        {messages.map((message) => (
          <WhatsappMessageBubble
            key={message.id}
            message={message}
            isOutgoing={false}
          />
        ))}
      </StyledMessageList>
      <StyledReplyRow onSubmit={handleSubmit}>
        <StyledReplyInput
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder={t`Type a reply...`}
        />
        <Button type="submit" disabled={sending} title={t`Send`} />
      </StyledReplyRow>
    </StyledContainer>
  );
};
```

`contactPhoneNumber`/`isOutgoing` above are placeholders for a real per-message direction and thread-contact lookup — the generic `Message`/`MessageParticipant` fetch in `useWhatsappThreadForPerson` (Task 6, Step 3) only selects `id`/`text`/`receivedAt`/`createdAt`, not `messageParticipants`. Before finalizing this step: extend `useWhatsappThreadForPerson` to also fetch each message's `messageParticipants` (same nested-fetch pattern `useEmailThread.ts` uses for `messageSenders`, i.e. a second `useFindManyRecords<...>({ objectNameSingular: CoreObjectNameSingular.MessageParticipant, filter: { messageId: { in: messages.map(m => m.id) } } })`), derive `isOutgoing` per message from whether its `FROM` participant's `handle` equals the connected WhatsApp channel's own number (`channels[0]?.displayPhoneNumber`) rather than the contact's, and derive `contactPhoneNumber` from the thread's contact participant handle (not `targetRecord.id`, which is a UUID, not a phone number). Confirm `WhatsappChannel` type (`@/accounts/types/WhatsappChannel`) exposes `connectedAccountId` and `displayPhoneNumber` fields before wiring this — both were seen on the backend `WhatsappChannelEntity` in Task 1-4 research, confirm the frontend type mirrors them with the same names.

- [ ] **Step 12: Run the test to verify it passes**

Run: `cd packages/asturian-front && npx jest WhatsappCard --config=jest.config.mjs`
Expected: PASS

- [ ] **Step 13: Typecheck and lint**

Run: `npx nx typecheck asturian-front`
Run: `npx nx lint:diff-with-main asturian-front`
Expected: no new errors — this also validates Task 5's `WhatsappWidget` import now resolves.

- [ ] **Step 14: Commit**

```bash
git add packages/asturian-front/src/modules/activities/whatsapp
git commit -m "feat(front): WhatsappCard mostra a conversa e permite responder"
```

---

## Task 7: Global WhatsApp inbox page

A standalone route listing every WhatsApp conversation in the workspace, with the selected conversation's chat open on the right — reuses `WhatsappMessageBubble` and `useSendWhatsappMessage` from Task 6.

**Files:**
- Create: `packages/asturian-front/src/modules/activities/whatsapp/graphql/queries/getWhatsappConversations.ts`
- Create: `packages/asturian-front/src/modules/activities/whatsapp/hooks/useWhatsappConversations.ts`
- Create: `packages/asturian-front/src/modules/activities/whatsapp/components/WhatsappInboxConversationListItem.tsx`
- Create: `packages/asturian-front/src/pages/whatsapp-inbox/WhatsappInboxPage.tsx`
- Create: `packages/asturian-front/src/pages/whatsapp-inbox/__tests__/WhatsappInboxPage.test.tsx`
- Modify: the app's route definitions file (search for where `AppPath`/router routes are declared, e.g. `grep -rn "AppPath\." packages/asturian-front/src/modules/types/AppPath.ts` and the router setup that maps `AppPath` values to page components) to add a `WHATSAPP_INBOX` route rendering `WhatsappInboxPage`.
- Modify: the main navigation drawer component (search for where nav items are declared, e.g. `grep -rn "isWhatsappMessagingEnabledState" packages/asturian-front/src/modules` already found 3 usage sites during planning — check `SettingsAccountsSettingsSection.tsx` and `SettingsAccountsListEmptyStateCard.tsx` for the exact `useRecoilValue`/`useAtomStateValue`-equivalent read pattern used for this atom, then add a nav item gated the same way) to add a "WhatsApp Inbox" entry gated by `isWhatsappMessagingEnabledState`.

**Interfaces:**
- Consumes: `WhatsappMessageBubble`, `useSendWhatsappMessage`, `useMyWhatsappChannels` (all from Task 6).
- Consumes: `getWhatsappConversations` query (Task 4).

- [ ] **Step 1: Add the GraphQL query**

```typescript
// packages/asturian-front/src/modules/activities/whatsapp/graphql/queries/getWhatsappConversations.ts
import { gql } from '@apollo/client';

export const GET_WHATSAPP_CONVERSATIONS = gql`
  query GetWhatsappConversations {
    getWhatsappConversations {
      messageThreadId
      contactPhoneNumber
      contactDisplayName
      personId
      lastMessageBody
      lastMessageReceivedAt
    }
  }
`;
```

- [ ] **Step 2: Build `useWhatsappConversations`**

```typescript
// packages/asturian-front/src/modules/activities/whatsapp/hooks/useWhatsappConversations.ts
import { GET_WHATSAPP_CONVERSATIONS } from '@/activities/whatsapp/graphql/queries/getWhatsappConversations';
import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { useQuery } from '@apollo/client/react';
import {
  type GetWhatsappConversationsQuery,
} from '~/generated-metadata/graphql';

export const useWhatsappConversations = () => {
  const apolloCoreClient = useApolloCoreClient();

  const { data, loading } = useQuery<GetWhatsappConversationsQuery>(
    GET_WHATSAPP_CONVERSATIONS,
    { client: apolloCoreClient },
  );

  return {
    conversations: data?.getWhatsappConversations ?? [],
    loading,
  };
};
```

- [ ] **Step 3: Build the conversation list item**

```tsx
// packages/asturian-front/src/modules/activities/whatsapp/components/WhatsappInboxConversationListItem.tsx
import { styled } from '@linaria/react';
import { themeCssVariables } from 'zyra-ui/theme-constants';

type WhatsappInboxConversationListItemProps = {
  contactDisplayName: string;
  contactPhoneNumber: string;
  lastMessageBody: string;
  lastMessageReceivedAt: string;
  isActive: boolean;
  onClick: () => void;
};

const StyledItem = styled.button<{ isActive: boolean }>`
  background: ${({ isActive }) =>
    isActive ? themeCssVariables.background.tertiary : 'transparent'};
  border: none;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[1]};
  padding: ${themeCssVariables.spacing[3]};
  text-align: left;
  width: 100%;
`;

const StyledPreview = styled.span`
  color: ${themeCssVariables.font.color.tertiary};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const WhatsappInboxConversationListItem = ({
  contactDisplayName,
  contactPhoneNumber,
  lastMessageBody,
  lastMessageReceivedAt,
  isActive,
  onClick,
}: WhatsappInboxConversationListItemProps) => {
  return (
    <StyledItem isActive={isActive} onClick={onClick} type="button">
      <span>{contactDisplayName || contactPhoneNumber}</span>
      <StyledPreview>{lastMessageBody}</StyledPreview>
      <StyledPreview>
        {new Date(lastMessageReceivedAt).toLocaleString()}
      </StyledPreview>
    </StyledItem>
  );
};
```

- [ ] **Step 4: Write the failing test for `WhatsappInboxPage`**

```tsx
// packages/asturian-front/src/pages/whatsapp-inbox/__tests__/WhatsappInboxPage.test.tsx
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { WhatsappInboxPage } from '@/pages/whatsapp-inbox/WhatsappInboxPage';
import { renderWithProviders } from '~/testing/utils/renderWithProviders';

jest.mock('@/activities/whatsapp/hooks/useWhatsappConversations', () => ({
  useWhatsappConversations: () => ({
    conversations: [
      {
        messageThreadId: 'thread-1',
        contactPhoneNumber: '5511999999999',
        contactDisplayName: 'Maria',
        personId: null,
        lastMessageBody: 'Oi, tudo bem?',
        lastMessageReceivedAt: '2026-09-28T10:00:00Z',
      },
    ],
    loading: false,
  }),
}));

describe('WhatsappInboxPage', () => {
  it('lists conversations and opens one when clicked', async () => {
    const user = userEvent.setup();

    renderWithProviders(<WhatsappInboxPage />);

    const conversationEntry = await screen.findByText('Maria');

    await user.click(conversationEntry);

    expect(conversationEntry).toBeVisible();
  });
});
```

- [ ] **Step 5: Run the test to verify it fails**

Run: `cd packages/asturian-front && npx jest WhatsappInboxPage --config=jest.config.mjs`
Expected: FAIL — `WhatsappInboxPage` module not found.

- [ ] **Step 6: Implement `WhatsappInboxPage`**

```tsx
// packages/asturian-front/src/pages/whatsapp-inbox/WhatsappInboxPage.tsx
import { useState } from 'react';

import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { themeCssVariables } from 'zyra-ui/theme-constants';

import { WhatsappInboxConversationListItem } from '@/activities/whatsapp/components/WhatsappInboxConversationListItem';
import { WhatsappMessageBubble } from '@/activities/whatsapp/components/WhatsappMessageBubble';
import { useSendWhatsappMessage } from '@/activities/whatsapp/hooks/useSendWhatsappMessage';
import { useWhatsappConversations } from '@/activities/whatsapp/hooks/useWhatsappConversations';
import { useWhatsappThreadForPerson } from '@/activities/whatsapp/hooks/useWhatsappThreadForPerson';
import { useMyWhatsappChannels } from '@/settings/accounts/hooks/useMyWhatsappChannels';
import { SettingsEmptyPlaceholder } from '@/settings/components/SettingsEmptyPlaceholder';

const StyledLayout = styled.div`
  display: grid;
  grid-template-columns: 320px 1fr;
  height: 100%;
`;

const StyledConversationList = styled.div`
  border-right: 1px solid ${themeCssVariables.border.color.medium};
  overflow-y: auto;
`;

const StyledConversationPanel = styled.div`
  display: flex;
  flex-direction: column;
  overflow: hidden;
  padding: ${themeCssVariables.spacing[6]};
`;

export const WhatsappInboxPage = () => {
  const { t } = useLingui();
  const { conversations, loading } = useWhatsappConversations();
  const { channels } = useMyWhatsappChannels();
  const { sendWhatsappMessage } = useSendWhatsappMessage();

  const [selectedContactPhoneNumber, setSelectedContactPhoneNumber] = useState<
    string | null
  >(null);
  const [draft, setDraft] = useState('');

  const selectedConversation = conversations.find(
    (conversation) => conversation.contactPhoneNumber === selectedContactPhoneNumber,
  );

  const { messages } = useWhatsappThreadForPerson(
    selectedConversation?.personId ?? '',
  );

  const handleSend = async () => {
    const connectedAccountId = channels[0]?.connectedAccountId;

    if (!connectedAccountId || !selectedContactPhoneNumber || draft.trim().length === 0) {
      return;
    }

    const wasSent = await sendWhatsappMessage({
      connectedAccountId,
      to: selectedContactPhoneNumber,
      body: draft.trim(),
    });

    if (wasSent) {
      setDraft('');
    }
  };

  if (loading) {
    return <SettingsEmptyPlaceholder>{t`Loading conversations...`}</SettingsEmptyPlaceholder>;
  }

  return (
    <StyledLayout>
      <StyledConversationList>
        {conversations.map((conversation) => (
          <WhatsappInboxConversationListItem
            key={conversation.messageThreadId}
            contactDisplayName={conversation.contactDisplayName}
            contactPhoneNumber={conversation.contactPhoneNumber}
            lastMessageBody={conversation.lastMessageBody}
            lastMessageReceivedAt={conversation.lastMessageReceivedAt}
            isActive={conversation.contactPhoneNumber === selectedContactPhoneNumber}
            onClick={() => setSelectedContactPhoneNumber(conversation.contactPhoneNumber)}
          />
        ))}
      </StyledConversationList>
      <StyledConversationPanel>
        {!selectedConversation && (
          <SettingsEmptyPlaceholder>{t`Select a conversation`}</SettingsEmptyPlaceholder>
        )}
        {selectedConversation && (
          <>
            {messages.map((message) => (
              <WhatsappMessageBubble key={message.id} message={message} isOutgoing={false} />
            ))}
            <input
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder={t`Type a reply...`}
            />
            <button type="button" onClick={handleSend}>
              {t`Send`}
            </button>
          </>
        )}
      </StyledConversationPanel>
    </StyledLayout>
  );
};
```

`useWhatsappThreadForPerson(selectedConversation?.personId ?? '')` reuses Task 6's hook by `personId`, which means an unmatched conversation (`personId: null` — no Person record yet) can't show its history here. Before finalizing this step, add a `messageThreadId`-based variant: change `useWhatsappThreadForPerson` (Task 6) to accept either `{ personId: string }` or `{ messageThreadId: string }`, skipping the `GET_WHATSAPP_THREAD_ID_FOR_PERSON` lookup when a `messageThreadId` is passed directly — the inbox page already has `selectedConversation.messageThreadId` from the conversations list and should use that form instead of round-tripping through `personId`.

- [ ] **Step 7: Run the test to verify it passes**

Run: `cd packages/asturian-front && npx jest WhatsappInboxPage --config=jest.config.mjs`
Expected: PASS

- [ ] **Step 8: Wire the route**

Read `packages/asturian-front/src/modules/types/AppPath.ts` (or wherever `AppPath` is defined) and the router file that maps each `AppPath` to a page component. Add a new `AppPath.WhatsappInbox` (or equivalent naming already used, e.g. `WHATSAPP_INBOX`) value and a route entry rendering `<WhatsappInboxPage />`, following the exact pattern of the nearest existing full-page route (not a settings sub-route).

- [ ] **Step 9: Add the nav entry**

Read one of the existing `isWhatsappMessagingEnabledState` read sites (e.g. `packages/asturian-front/src/modules/settings/accounts/components/SettingsAccountsSettingsSection.tsx:50`) to copy its exact state-read hook call. Find the main navigation drawer's item list (search `grep -rn "NavigationDrawerItem" packages/asturian-front/src/modules/navigation` or similar) and add an item linking to the new route, rendered only when `isWhatsappMessagingEnabledState` reads `true`.

- [ ] **Step 10: Typecheck and lint**

Run: `npx nx typecheck asturian-front`
Run: `npx nx lint:diff-with-main asturian-front`
Expected: no new errors.

- [ ] **Step 11: Manual verification**

Run: `npm run dev`. With a WhatsApp channel connected (Settings → Accounts) and at least one inbound message imported, open the new WhatsApp Inbox nav entry, confirm the conversation list shows it, click it, confirm the message history loads, send a reply, confirm it appears and the AI toggle (Settings → Accounts → that agent's conversations) flips off if an agent was configured. Then open that contact's Person record, confirm the WhatsApp tab (added manually via "Add tab" if this is an existing workspace, per Task 5 Step 7) shows the same conversation.

- [ ] **Step 12: Commit**

```bash
git add packages/asturian-front/src/modules/activities/whatsapp packages/asturian-front/src/pages/whatsapp-inbox
git commit -m "feat(front): inbox global de whatsapp com lista de conversas e resposta"
```

---

## Self-review notes

- **Spec coverage:** every section of `docs/superpowers/specs/2026-09-28-whatsapp-inbox-design.md` maps to a task — phone-matching fix → Task 1; `sendWhatsappMessage` → Task 2; AI hand-off → Task 3; query support → Task 4; record widget → Tasks 5-6; global inbox → Task 7. The 24h-window non-goal is handled by Task 2 surfacing the outbound error as a typed `error` string rather than attempting template sending.
- **Scope discovered during planning, not in the original spec:** the Person-page widget can't be a plain hard-coded component — it has to register as a `WidgetType` in the existing configurable page-layout system (Task 5). This was confirmed cheap (a handful of one-line switch/hashmap additions, following `EMAILS`'s exact pattern) rather than the heavier "full subsystem" risk first suspected — no separate follow-up plan needed.
- **Known follow-up not in this plan:** existing workspaces don't automatically get the new "WhatsApp" tab on the Person page (only new ones seeded from `DefaultPersonRecordPageLayout.ts` do) — a workspace admin adds it manually via the layout editor's "Add tab" flow, same as any other optional widget. An `@RegisteredWorkspaceCommand` to backfill it automatically was deliberately left out (YAGNI for a single/few-workspace deployment); revisit if this ever needs to reach many existing workspaces unattended.
