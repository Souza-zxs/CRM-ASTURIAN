import { Scope } from '@nestjs/common';

import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { InstagramCommentAutomationService } from 'src/modules/instagram-webhooks/services/instagram-comment-automation.service';
import { type InstagramWebhookCommentValue } from 'src/modules/instagram-webhooks/types/instagram-webhook-payload.type';

export type InstagramInboundCommentWebhookJobData = {
  igBusinessAccountId: string;
  commentValue: InstagramWebhookCommentValue;
};

@Processor({
  queueName: MessageQueue.instagramQueue,
  scope: Scope.REQUEST,
})
export class InstagramInboundCommentWebhookJob {
  constructor(
    private readonly instagramCommentAutomationService: InstagramCommentAutomationService,
  ) {}

  @Process(InstagramInboundCommentWebhookJob.name)
  async handle(data: InstagramInboundCommentWebhookJobData): Promise<void> {
    await this.instagramCommentAutomationService.processComment(
      data.igBusinessAccountId,
      data.commentValue,
    );
  }
}
