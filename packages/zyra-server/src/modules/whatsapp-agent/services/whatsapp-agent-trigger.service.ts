import { Injectable, Logger } from '@nestjs/common';

import { isDefined } from 'zyra-shared/utils';

import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { ZyraConfigService } from 'src/engine/core-modules/zyra-config/zyra-config.service';
import { WhatsappAgentEntity } from 'src/engine/metadata-modules/whatsapp-agent/entities/whatsapp-agent.entity';
import { InjectWorkspaceScopedRepository } from 'src/engine/zyra-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/zyra-orm/workspace-scoped-repository/workspace-scoped-repository';
import {
  WhatsappAgentResponderJob,
  type WhatsappAgentResponderJobData,
} from 'src/modules/whatsapp-agent/jobs/whatsapp-agent-responder.job';

export type WhatsappAgentIncomingMessage = {
  workspaceId: string;
  whatsappChannelId: string;
  contactPhoneNumber: string;
  text: string;
};

// Entry point called right after an inbound WhatsApp message is saved to the
// CRM inbox (see WhatsappInboundMessageImportService) — decides whether the
// AI agent should react at all, and if so, enqueues the actual work onto
// MessageQueue.whatsappAgentQueue so the (potentially slow) OpenAI call never
// blocks or risks failing the webhook/import path itself.
@Injectable()
export class WhatsappAgentTriggerService {
  private readonly logger = new Logger(WhatsappAgentTriggerService.name);

  constructor(
    @InjectWorkspaceScopedRepository(WhatsappAgentEntity)
    private readonly whatsappAgentRepository: WorkspaceScopedRepository<WhatsappAgentEntity>,
    private readonly zyraConfigService: ZyraConfigService,
    @InjectMessageQueue(MessageQueue.whatsappAgentQueue)
    private readonly messageQueueService: MessageQueueService,
  ) {}

  async enqueueIncomingMessage({
    workspaceId,
    whatsappChannelId,
    contactPhoneNumber,
    text,
  }: WhatsappAgentIncomingMessage): Promise<void> {
    try {
      if (!this.zyraConfigService.get('IS_WHATSAPP_AI_AGENT_ENABLED')) {
        return;
      }

      const whatsappAgent = await this.whatsappAgentRepository.findOne(
        workspaceId,
        { where: { whatsappChannelId, isActive: true } },
      );

      if (!isDefined(whatsappAgent)) {
        return;
      }

      await this.messageQueueService.add<WhatsappAgentResponderJobData>(
        WhatsappAgentResponderJob.name,
        {
          workspaceId,
          whatsappAgentId: whatsappAgent.id,
          contactPhoneNumber,
          text,
        },
      );
    } catch (error) {
      // This trigger is supplementary to the already-working inbound import
      // flow — a failure here must never take down message import itself.
      this.logger.error(
        `Failed to enqueue whatsapp agent response for channel ${whatsappChannelId}: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }
}
