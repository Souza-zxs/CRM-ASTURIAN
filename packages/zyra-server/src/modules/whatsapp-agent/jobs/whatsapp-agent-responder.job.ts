import { Scope } from '@nestjs/common';

import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import {
  WhatsappAgentResponderService,
  type WhatsappAgentRespondInput,
} from 'src/modules/whatsapp-agent/services/whatsapp-agent-responder.service';

export type WhatsappAgentResponderJobData = WhatsappAgentRespondInput;

@Processor({
  queueName: MessageQueue.whatsappAgentQueue,
  scope: Scope.REQUEST,
})
export class WhatsappAgentResponderJob {
  constructor(
    private readonly whatsappAgentResponderService: WhatsappAgentResponderService,
  ) {}

  @Process(WhatsappAgentResponderJob.name)
  async handle(data: WhatsappAgentResponderJobData): Promise<void> {
    await this.whatsappAgentResponderService.respond(data);
  }
}
