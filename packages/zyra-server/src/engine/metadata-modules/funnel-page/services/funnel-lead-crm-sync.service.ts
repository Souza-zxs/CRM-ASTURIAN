import { Injectable, Logger } from '@nestjs/common';

import { type ActorMetadata, FieldActorSource } from 'zyra-shared/types';
import { isDefined } from 'zyra-shared/utils';

import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { CreateRecordService } from 'src/engine/core-modules/record-crud/services/create-record.service';
import { FindRecordsService } from 'src/engine/core-modules/record-crud/services/find-records.service';
import { UpdateRecordService } from 'src/engine/core-modules/record-crud/services/update-record.service';
import { type CreateFunnelLeadInput } from 'src/engine/metadata-modules/funnel-page/dtos/create-funnel-lead.input';
import { parseFunnelLeadName } from 'src/engine/metadata-modules/funnel-page/utils/parse-funnel-lead-name.util';
import { parseFunnelLeadPhone } from 'src/engine/metadata-modules/funnel-page/utils/parse-funnel-lead-phone.util';
import { buildSystemAuthContext } from 'src/engine/zyra-orm/utils/build-system-auth-context.util';

// The visitor has no session, so records are attributed to the public form
// (same shape the workflow webhook trigger uses).
const FUNNEL_ACTOR: ActorMetadata = {
  source: FieldActorSource.WEBHOOK,
  workspaceMemberId: null,
  name: 'Funil',
  context: {},
};

const getRecordId = (record: unknown): string | null => {
  if (
    typeof record === 'object' &&
    record !== null &&
    'id' in record &&
    typeof record.id === 'string'
  ) {
    return record.id;
  }

  return null;
};

@Injectable()
export class FunnelLeadCrmSyncService {
  private readonly logger = new Logger(FunnelLeadCrmSyncService.name);

  constructor(
    private readonly findRecordsService: FindRecordsService,
    private readonly createRecordService: CreateRecordService,
    private readonly updateRecordService: UpdateRecordService,
  ) {}

  // Never throws: the lead is already saved in funnelLead by the time this
  // runs, and a CRM failure must not lose it or fail the visitor's form.
  async syncLeadToCrm({
    workspaceId,
    lead,
  }: {
    workspaceId: string;
    lead: CreateFunnelLeadInput;
  }): Promise<void> {
    try {
      const authContext = buildSystemAuthContext(workspaceId);
      const personId = await this.findOrCreatePersonId({ authContext, lead });

      await this.createOpportunity({ authContext, personId, lead });
    } catch (error) {
      // Not logging the lead's email/phone (LGPD): the message alone is enough.
      this.logger.error(
        `Failed to sync funnel lead to CRM in workspace ${workspaceId}: ${
          error instanceof Error ? error.message : 'unknown error'
        }`,
      );
    }
  }

  // Moves the lead's opportunity from NEW to MEETING once they open the
  // workshop page. Only NEW opportunities are touched, so a lead who already
  // advanced further (or reloads the page) is never moved backwards.
  async markLeadAsAttendee({
    workspaceId,
    email,
  }: {
    workspaceId: string;
    email: string;
  }): Promise<void> {
    try {
      const authContext = buildSystemAuthContext(workspaceId);
      const personId = await this.findPersonId({ authContext, email });

      if (!isDefined(personId)) {
        return;
      }

      const newOpportunities = await this.findRecordsService.execute({
        objectName: 'opportunity',
        filter: { pointOfContactId: { eq: personId }, stage: { eq: 'NEW' } },
        limit: 1,
        authContext,
        shouldBuildEffectiveSelectFields: false,
      });

      const opportunityId = getRecordId(newOpportunities.result?.records[0]);

      if (!isDefined(opportunityId)) {
        return;
      }

      const updatedOpportunity = await this.updateRecordService.execute({
        objectName: 'opportunity',
        objectRecordId: opportunityId,
        objectRecord: { stage: 'MEETING' },
        authContext,
      });

      if (!updatedOpportunity.success) {
        throw new Error(
          `Could not update opportunity: ${updatedOpportunity.message}`,
        );
      }
    } catch (error) {
      this.logger.error(
        `Failed to mark funnel lead as attendee in workspace ${workspaceId}: ${
          error instanceof Error ? error.message : 'unknown error'
        }`,
      );
    }
  }

  private async findPersonId({
    authContext,
    email,
  }: {
    authContext: WorkspaceAuthContext;
    email: string;
  }): Promise<string | null> {
    const existingPeople = await this.findRecordsService.execute({
      objectName: 'person',
      filter: { emails: { primaryEmail: { eq: email } } },
      limit: 1,
      authContext,
      shouldBuildEffectiveSelectFields: false,
    });

    return getRecordId(existingPeople.result?.records[0]);
  }

  // Same email twice (a lead signing up again, or already in the CRM) must
  // not create a duplicate person.
  private async findOrCreatePersonId({
    authContext,
    lead,
  }: {
    authContext: WorkspaceAuthContext;
    lead: CreateFunnelLeadInput;
  }): Promise<string> {
    const existingPersonId = await this.findPersonId({
      authContext,
      email: lead.email,
    });

    if (isDefined(existingPersonId)) {
      return existingPersonId;
    }

    const createdPerson = await this.createRecordService.execute({
      objectName: 'person',
      objectRecord: {
        name: parseFunnelLeadName(lead.name),
        emails: { primaryEmail: lead.email },
        phones: parseFunnelLeadPhone(lead.whatsapp) ?? undefined,
      },
      authContext,
      createdBy: FUNNEL_ACTOR,
      slimResponse: true,
    });

    const createdPersonId = getRecordId(createdPerson.result);

    if (!createdPerson.success || !isDefined(createdPersonId)) {
      throw new Error(`Could not create person: ${createdPerson.message}`);
    }

    return createdPersonId;
  }

  private async createOpportunity({
    authContext,
    personId,
    lead,
  }: {
    authContext: WorkspaceAuthContext;
    personId: string;
    lead: CreateFunnelLeadInput;
  }): Promise<void> {
    const createdOpportunity = await this.createRecordService.execute({
      objectName: 'opportunity',
      objectRecord: {
        name: `Workshop - ${lead.name}`,
        stage: 'NEW',
        pointOfContactId: personId,
      },
      authContext,
      createdBy: FUNNEL_ACTOR,
      slimResponse: true,
    });

    if (!createdOpportunity.success) {
      throw new Error(
        `Could not create opportunity: ${createdOpportunity.message}`,
      );
    }
  }
}
