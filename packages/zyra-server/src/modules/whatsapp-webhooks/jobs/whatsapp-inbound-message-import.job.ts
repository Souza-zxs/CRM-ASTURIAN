import { Scope } from '@nestjs/common';

import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { WhatsappInboundMessageImportService } from 'src/modules/whatsapp-webhooks/services/whatsapp-inbound-message-import.service';
import { type WhatsappWebhookChangeValue } from 'src/modules/whatsapp-webhooks/types/whatsapp-webhook-payload.type';

export type WhatsappInboundMessageImportJobData = {
  changeValue: WhatsappWebhookChangeValue;
};

@Processor({
  queueName: MessageQueue.whatsappQueue,
  scope: Scope.REQUEST,
})
export class WhatsappInboundMessageImportJob {
  constructor(
    private readonly whatsappInboundMessageImportService: WhatsappInboundMessageImportService,
  ) {}

  @Process(WhatsappInboundMessageImportJob.name)
  async handle(data: WhatsappInboundMessageImportJobData): Promise<void> {
    await this.whatsappInboundMessageImportService.importChange(
      data.changeValue,
    );
  }
}
