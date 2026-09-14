import { Command, CommandRunner } from 'nest-commander';

import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import {
  INSTAGRAM_COMMENT_RECONCILIATION_CRON_PATTERN,
  InstagramCommentReconciliationCronJob,
} from 'src/modules/instagram-crons/crons/jobs/instagram-comment-reconciliation.cron.job';

@Command({
  name: 'cron:instagram:comment-reconciliation',
  description:
    'Starts a cron job that re-fetches recent Instagram comments for active automation rules and replays any the webhook missed',
})
export class InstagramCommentReconciliationCronCommand extends CommandRunner {
  constructor(
    @InjectMessageQueue(MessageQueue.cronQueue)
    private readonly messageQueueService: MessageQueueService,
  ) {
    super();
  }

  async run(): Promise<void> {
    await this.messageQueueService.addCron<undefined>({
      jobName: InstagramCommentReconciliationCronJob.name,
      data: undefined,
      options: {
        repeat: {
          pattern: INSTAGRAM_COMMENT_RECONCILIATION_CRON_PATTERN,
        },
      },
    });
  }
}
