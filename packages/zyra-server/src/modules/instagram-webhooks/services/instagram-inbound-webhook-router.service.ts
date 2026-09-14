import { Injectable, Logger } from '@nestjs/common';

import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import {
  InstagramInboundCommentWebhookJob,
  type InstagramInboundCommentWebhookJobData,
} from 'src/modules/instagram-webhooks/jobs/instagram-inbound-comment-webhook.job';
import { type InstagramWebhookPayload } from 'src/modules/instagram-webhooks/types/instagram-webhook-payload.type';

@Injectable()
export class InstagramInboundWebhookRouterService {
  private readonly logger = new Logger(
    InstagramInboundWebhookRouterService.name,
  );

  constructor(
    @InjectMessageQueue(MessageQueue.instagramQueue)
    private readonly messageQueueService: MessageQueueService,
  ) {}

  async route(payload: InstagramWebhookPayload): Promise<void> {
    if (payload.object !== 'instagram') {
      this.logger.warn(
        `Ignoring webhook for unexpected object ${payload.object}`,
      );

      return;
    }

    for (const entry of payload.entry) {
      for (const change of entry.changes) {
        // Only top-level comments can trigger a "keyword -> private reply"
        // rule — replies-to-comments carry a parent_id and are ignored.
        if (change.field !== 'comments' || change.value.parent_id) {
          continue;
        }

        await this.messageQueueService.add<InstagramInboundCommentWebhookJobData>(
          InstagramInboundCommentWebhookJob.name,
          { igBusinessAccountId: entry.id, commentValue: change.value },
        );
      }
    }
  }
}
