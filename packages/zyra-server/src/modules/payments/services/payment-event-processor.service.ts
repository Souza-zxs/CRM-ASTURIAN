import { Injectable, Logger } from '@nestjs/common';

import { OrderByDirection } from 'zyra-shared/types';
import { isDefined } from 'zyra-shared/utils';

import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { CreateRecordService } from 'src/engine/core-modules/record-crud/services/create-record.service';
import { FindRecordsService } from 'src/engine/core-modules/record-crud/services/find-records.service';
import { UpdateRecordService } from 'src/engine/core-modules/record-crud/services/update-record.service';
import { type PaymentProvider } from 'src/engine/metadata-modules/payments/entities/payment-provider-connection.entity';
import { parseFunnelLeadPhone } from 'src/engine/metadata-modules/funnel-page/utils/parse-funnel-lead-phone.util';
import { GlobalWorkspaceOrmManager } from 'src/engine/zyra-orm/global-workspace-datasource/global-workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/zyra-orm/utils/build-system-auth-context.util';
import { type NormalizedPaymentEvent } from 'src/modules/payments/types/normalized-payment-event.type';

const CUSTOMER_STAGE = 'CUSTOMER';
// Opportunity has no stored history of "which stage came before CUSTOMER",
// so a refund reverts to PROPOSAL — the pipeline stage immediately before a
// purchase, and a reasonable single answer to "what stage should this go
// back to" without adding a whole stage-history table for it.
const REFUND_REVERT_STAGE = 'PROPOSAL';

const describeFailure = (result: { message: string; error?: string }) =>
  isDefined(result.error) ? `${result.message} (${result.error})` : result.message;

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

const formatAmount = (amount: NormalizedPaymentEvent['amount']): string =>
  `${amount.currency} ${amount.value.toFixed(2)}`;

@Injectable()
export class PaymentEventProcessorService {
  private readonly logger = new Logger(PaymentEventProcessorService.name);

  constructor(
    private readonly findRecordsService: FindRecordsService,
    private readonly createRecordService: CreateRecordService,
    private readonly updateRecordService: UpdateRecordService,
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
  ) {}

  async processEvent({
    workspaceId,
    provider,
    event,
  }: {
    workspaceId: string;
    provider: PaymentProvider;
    event: NormalizedPaymentEvent;
  }): Promise<void> {
    const authContext = buildSystemAuthContext(workspaceId);

    await this.globalWorkspaceOrmManager.executeInWorkspaceContext(
      async () => {
        const personId = await this.findOrCreatePersonId({
          authContext,
          event,
        });

        if (event.type === 'purchase') {
          await this.handlePurchase({
            authContext,
            personId,
            provider,
            event,
          });
        } else {
          await this.handleRefund({ authContext, personId, provider, event });
        }
      },
      authContext,
    );
  }

  private async findPersonId({
    authContext,
    event,
  }: {
    authContext: WorkspaceAuthContext;
    event: NormalizedPaymentEvent;
  }): Promise<string | null> {
    if (isDefined(event.buyer.email)) {
      const byEmail = await this.findRecordsService.execute({
        objectName: 'person',
        filter: { emails: { primaryEmail: { eq: event.buyer.email } } },
        limit: 1,
        authContext,
        shouldBuildEffectiveSelectFields: false,
      });
      const personId = getRecordId(byEmail.result?.records[0]);

      if (isDefined(personId)) {
        return personId;
      }
    }

    const parsedPhone = isDefined(event.buyer.phone)
      ? parseFunnelLeadPhone(event.buyer.phone)
      : null;

    if (isDefined(parsedPhone)) {
      const byPhone = await this.findRecordsService.execute({
        objectName: 'person',
        filter: {
          phones: { primaryPhoneNumber: { eq: parsedPhone.primaryPhoneNumber } },
        },
        limit: 1,
        authContext,
        shouldBuildEffectiveSelectFields: false,
      });
      const personId = getRecordId(byPhone.result?.records[0]);

      if (isDefined(personId)) {
        return personId;
      }
    }

    return null;
  }

  // "Compra direta": a purchase that didn't come through the workshop funnel
  // (a direct checkout link, for instance) still needs a Person to attach
  // the Opportunity/purchase note to.
  private async findOrCreatePersonId({
    authContext,
    event,
  }: {
    authContext: WorkspaceAuthContext;
    event: NormalizedPaymentEvent;
  }): Promise<string> {
    const existingPersonId = await this.findPersonId({ authContext, event });

    if (isDefined(existingPersonId)) {
      return existingPersonId;
    }

    const parsedPhone = isDefined(event.buyer.phone)
      ? parseFunnelLeadPhone(event.buyer.phone)
      : null;
    const [firstName, ...lastNameParts] = (event.buyer.name ?? 'Cliente').split(
      ' ',
    );

    const createdPerson = await this.createRecordService.execute({
      objectName: 'person',
      objectRecord: {
        name: {
          firstName,
          lastName: lastNameParts.join(' ') || '',
        },
        ...(isDefined(event.buyer.email) && {
          emails: { primaryEmail: event.buyer.email },
        }),
        ...(isDefined(parsedPhone) && { phones: parsedPhone }),
      },
      authContext,
      slimResponse: true,
    });

    const createdPersonId = getRecordId(createdPerson.result);

    if (!createdPerson.success || !isDefined(createdPersonId)) {
      throw new Error(
        `Could not create person for direct purchase: ${describeFailure(createdPerson)}`,
      );
    }

    return createdPersonId;
  }

  private async findMostRecentOpportunityId({
    authContext,
    personId,
    stage,
  }: {
    authContext: WorkspaceAuthContext;
    personId: string;
    stage?: { eq: string } | { neq: string };
  }): Promise<string | null> {
    const opportunities = await this.findRecordsService.execute({
      objectName: 'opportunity',
      filter: {
        pointOfContactId: { eq: personId },
        ...(isDefined(stage) && { stage }),
      },
      orderBy: [{ createdAt: OrderByDirection.DescNullsLast }],
      limit: 1,
      authContext,
      shouldBuildEffectiveSelectFields: false,
    });

    return getRecordId(opportunities.result?.records[0]);
  }

  private async handlePurchase({
    authContext,
    personId,
    provider,
    event,
  }: {
    authContext: WorkspaceAuthContext;
    personId: string;
    provider: PaymentProvider;
    event: NormalizedPaymentEvent;
  }): Promise<void> {
    const openOpportunityId = await this.findMostRecentOpportunityId({
      authContext,
      personId,
      stage: { neq: CUSTOMER_STAGE },
    });

    const opportunityId = isDefined(openOpportunityId)
      ? openOpportunityId
      : await this.createDirectPurchaseOpportunity({
          authContext,
          personId,
          event,
        });

    if (isDefined(openOpportunityId)) {
      const updated = await this.updateRecordService.execute({
        objectName: 'opportunity',
        objectRecordId: opportunityId,
        objectRecord: { stage: CUSTOMER_STAGE },
        authContext,
      });

      if (!updated.success) {
        throw new Error(
          `Could not move opportunity to ${CUSTOMER_STAGE}: ${describeFailure(updated)}`,
        );
      }
    }

    await this.createPurchaseNote({
      authContext,
      opportunityId,
      provider,
      event,
      title: `Compra aprovada — ${event.product.name} — ${formatAmount(event.amount)}`,
    });
  }

  private async handleRefund({
    authContext,
    personId,
    provider,
    event,
  }: {
    authContext: WorkspaceAuthContext;
    personId: string;
    provider: PaymentProvider;
    event: NormalizedPaymentEvent;
  }): Promise<void> {
    const customerOpportunityId = await this.findMostRecentOpportunityId({
      authContext,
      personId,
      stage: { eq: CUSTOMER_STAGE },
    });

    if (!isDefined(customerOpportunityId)) {
      this.logger.warn(
        `Refund received for a contact with no ${CUSTOMER_STAGE} opportunity in workspace ${authContext.workspace.id} — recording the note only`,
      );

      const openOpportunityId = await this.findMostRecentOpportunityId({
        authContext,
        personId,
      });

      if (isDefined(openOpportunityId)) {
        await this.createPurchaseNote({
          authContext,
          opportunityId: openOpportunityId,
          provider,
          event,
          title: `Reembolso — ${event.product.name} — ${formatAmount(event.amount)}`,
        });
      }

      return;
    }

    const updated = await this.updateRecordService.execute({
      objectName: 'opportunity',
      objectRecordId: customerOpportunityId,
      objectRecord: { stage: REFUND_REVERT_STAGE },
      authContext,
    });

    if (!updated.success) {
      throw new Error(
        `Could not revert opportunity from ${CUSTOMER_STAGE} after refund: ${describeFailure(updated)}`,
      );
    }

    await this.createPurchaseNote({
      authContext,
      opportunityId: customerOpportunityId,
      provider,
      event,
      title: `Reembolso — ${event.product.name} — ${formatAmount(event.amount)}`,
    });
  }

  private async createDirectPurchaseOpportunity({
    authContext,
    personId,
    event,
  }: {
    authContext: WorkspaceAuthContext;
    personId: string;
    event: NormalizedPaymentEvent;
  }): Promise<string> {
    const created = await this.createRecordService.execute({
      objectName: 'opportunity',
      objectRecord: {
        name: `Compra direta - ${event.buyer.name ?? event.product.name}`,
        stage: CUSTOMER_STAGE,
        pointOfContactId: personId,
      },
      authContext,
      slimResponse: true,
    });

    const createdId = getRecordId(created.result);

    if (!created.success || !isDefined(createdId)) {
      throw new Error(
        `Could not create direct-purchase opportunity: ${describeFailure(created)}`,
      );
    }

    return createdId;
  }

  private async createPurchaseNote({
    authContext,
    opportunityId,
    provider,
    event,
    title,
  }: {
    authContext: WorkspaceAuthContext;
    opportunityId: string;
    provider: PaymentProvider;
    event: NormalizedPaymentEvent;
    title: string;
  }): Promise<void> {
    const createdNote = await this.createRecordService.execute({
      objectName: 'note',
      objectRecord: {
        title: `${title} (${provider}, ref. ${event.externalId})`,
      },
      authContext,
      slimResponse: true,
    });

    const noteId = getRecordId(createdNote.result);

    if (!createdNote.success || !isDefined(noteId)) {
      this.logger.error(
        `Purchase/refund note not recorded for opportunity ${opportunityId}: ${describeFailure(createdNote)}`,
      );

      return;
    }

    const createdNoteTarget = await this.createRecordService.execute({
      objectName: 'noteTarget',
      objectRecord: { noteId, targetOpportunityId: opportunityId },
      authContext,
      slimResponse: true,
    });

    if (!createdNoteTarget.success) {
      this.logger.error(
        `Note ${noteId} created but not linked to opportunity ${opportunityId}: ${describeFailure(createdNoteTarget)}`,
      );
    }
  }
}
