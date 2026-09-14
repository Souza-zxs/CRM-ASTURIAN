import { Injectable, Logger } from '@nestjs/common';

import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import {
  WhatsappInboundMessageImportJob,
  type WhatsappInboundMessageImportJobData,
} from 'src/modules/whatsapp-webhooks/jobs/whatsapp-inbound-message-import.job';
import { type WhatsappWebhookPayload } from 'src/modules/whatsapp-webhooks/types/whatsapp-webhook-payload.type';

@Injectable()
export class WhatsappInboundWebhookRouterService {
  private readonly logger = new Logger(WhatsappInboundWebhookRouterService.name);

  constructor(
    @InjectMessageQueue(MessageQueue.whatsappQueue)
    private readonly messageQueueService: MessageQueueService,
  ) {}

  async route(payload: WhatsappWebhookPayload): Promise<void> {
    if (payload.object !== 'whatsapp_business_account') {
      this.logger.warn(`Ignoring webhook for unexpected object ${payload.object}`);

      return;
    }

    for (const entry of payload.entry) {
      for (const change of entry.changes) {
        if (change.field !== 'messages') {
          continue;
        }

        await this.messageQueueService.add<WhatsappInboundMessageImportJobData>(
          WhatsappInboundMessageImportJob.name,
          { changeValue: change.value },
        );
      }
    }
  }
}
