import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';
import { WhatsappTemplateStatus } from 'zyra-shared/types';
import { isDefined, resolveInput } from 'zyra-shared/utils';

import { type WorkflowAction } from 'src/modules/workflow/workflow-executor/interfaces/workflow-action.interface';

import { ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import { ConnectedAccountTokenEncryptionService } from 'src/engine/metadata-modules/connected-account/services/connected-account-token-encryption.service';
import { WhatsappChannelEntity } from 'src/engine/metadata-modules/whatsapp-channel/entities/whatsapp-channel.entity';
import { WhatsappTemplateEntity } from 'src/engine/metadata-modules/whatsapp-template/entities/whatsapp-template.entity';
import {
  WorkflowStepExecutorException,
  WorkflowStepExecutorExceptionCode,
} from 'src/modules/workflow/workflow-executor/exceptions/workflow-step-executor.exception';
import { type WorkflowActionInput } from 'src/modules/workflow/workflow-executor/types/workflow-action-input';
import { type WorkflowActionOutput } from 'src/modules/workflow/workflow-executor/types/workflow-action-output.type';
import { findStepOrThrow } from 'src/modules/workflow/workflow-executor/utils/find-step-or-throw.util';
import { isWorkflowSendWhatsappTemplateAction } from 'src/modules/workflow/workflow-executor/workflow-actions/send-whatsapp-template/guards/is-workflow-send-whatsapp-template-action.guard';
import { type WorkflowSendWhatsappTemplateActionInput } from 'src/modules/workflow/workflow-executor/workflow-actions/send-whatsapp-template/types/workflow-send-whatsapp-template-action-input.type';
import { normalizeWhatsappRecipient } from 'src/modules/workflow/workflow-executor/workflow-actions/send-whatsapp-template/utils/normalize-whatsapp-recipient.util';
import { WhatsappGraphApiService } from 'src/modules/whatsapp/services/whatsapp-graph-api.service';

@Injectable()
export class SendWhatsappTemplateWorkflowAction implements WorkflowAction {
  private readonly logger = new Logger(SendWhatsappTemplateWorkflowAction.name);

  constructor(
    @InjectRepository(WhatsappTemplateEntity)
    private readonly whatsappTemplateRepository: Repository<WhatsappTemplateEntity>,
    @InjectRepository(WhatsappChannelEntity)
    private readonly whatsappChannelRepository: Repository<WhatsappChannelEntity>,
    @InjectRepository(ConnectedAccountEntity)
    private readonly connectedAccountRepository: Repository<ConnectedAccountEntity>,
    private readonly connectedAccountTokenEncryptionService: ConnectedAccountTokenEncryptionService,
    private readonly whatsappGraphApiService: WhatsappGraphApiService,
  ) {}

  async execute({
    currentStepId,
    steps,
    context,
    runInfo,
  }: WorkflowActionInput): Promise<WorkflowActionOutput> {
    const step = findStepOrThrow({ stepId: currentStepId, steps });

    if (!isWorkflowSendWhatsappTemplateAction(step)) {
      throw new WorkflowStepExecutorException(
        'Step is not a send WhatsApp template action',
        WorkflowStepExecutorExceptionCode.INVALID_STEP_TYPE,
      );
    }

    const input = resolveInput(
      step.settings.input,
      context,
    ) as WorkflowSendWhatsappTemplateActionInput;
    const { workspaceId } = runInfo;

    const recipient = normalizeWhatsappRecipient(input.to ?? '');

    if (recipient.length === 0) {
      throw new WorkflowStepExecutorException(
        'A recipient phone number is required to send a WhatsApp template',
        WorkflowStepExecutorExceptionCode.INVALID_STEP_INPUT,
      );
    }

    // Every lookup is scoped by workspaceId: the template id comes from the
    // step's settings, and must never resolve to another workspace's template.
    const whatsappTemplate = await this.whatsappTemplateRepository.findOne({
      where: { id: input.whatsappTemplateId, workspaceId },
    });

    if (!isDefined(whatsappTemplate)) {
      throw new WorkflowStepExecutorException(
        'WhatsApp template not found',
        WorkflowStepExecutorExceptionCode.INVALID_STEP_INPUT,
      );
    }

    // Meta rejects anything but an approved template, and a draft/pending one
    // would burn a run on a call that can only fail.
    if (whatsappTemplate.status !== WhatsappTemplateStatus.APPROVED) {
      throw new WorkflowStepExecutorException(
        `WhatsApp template "${whatsappTemplate.name}" is not approved yet (status: ${whatsappTemplate.status})`,
        WorkflowStepExecutorExceptionCode.INVALID_STEP_INPUT,
      );
    }

    const whatsappChannel = await this.whatsappChannelRepository.findOne({
      where: { id: whatsappTemplate.whatsappChannelId, workspaceId },
    });

    const connectedAccount = isDefined(whatsappChannel)
      ? await this.connectedAccountRepository.findOne({
          where: { id: whatsappChannel.connectedAccountId, workspaceId },
        })
      : null;

    if (
      !isDefined(whatsappChannel) ||
      !isDefined(connectedAccount) ||
      !isDefined(connectedAccount.accessToken)
    ) {
      throw new WorkflowStepExecutorException(
        'The WhatsApp channel of this template is not connected',
        WorkflowStepExecutorExceptionCode.INVALID_STEP_INPUT,
      );
    }

    const accessToken = this.connectedAccountTokenEncryptionService.decrypt({
      ciphertext: connectedAccount.accessToken,
      workspaceId,
    });

    try {
      const { messageExternalId } =
        await this.whatsappGraphApiService.sendTemplateMessage(
          whatsappChannel.phoneNumberId,
          accessToken,
          recipient,
          whatsappTemplate.name,
          whatsappTemplate.language,
          input.bodyParameters ?? [],
        );

      return { result: { messageExternalId } };
    } catch (error) {
      // A rejected send comes back as `error` (not thrown) so the step's
      // retry / continue-on-failure options apply. The recipient's number is
      // deliberately left out of the log (LGPD).
      const message = error instanceof Error ? error.message : String(error);

      this.logger.error(
        `Failed to send WhatsApp template "${whatsappTemplate.name}" in workspace ${workspaceId}: ${message}`,
      );

      return { error: message };
    }
  }
}
