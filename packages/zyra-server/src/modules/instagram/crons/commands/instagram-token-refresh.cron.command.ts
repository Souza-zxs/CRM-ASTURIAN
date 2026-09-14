import { Command, CommandRunner } from 'nest-commander';

import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import {
  INSTAGRAM_TOKEN_REFRESH_CRON_PATTERN,
  InstagramTokenRefreshCronJob,
} from 'src/modules/instagram/crons/jobs/instagram-token-refresh.cron.job';

@Command({
  name: 'cron:instagram:token-refresh',
  description:
    'Starts a cron job to refresh Instagram long-lived access tokens before they expire',
})
export class InstagramTokenRefreshCronCommand extends CommandRunner {
  constructor(
    @InjectMessageQueue(MessageQueue.cronQueue)
    private readonly messageQueueService: MessageQueueService,
  ) {
    super();
  }

  async run(): Promise<void> {
    await this.messageQueueService.addCron<undefined>({
      jobName: InstagramTokenRefreshCronJob.name,
      data: undefined,
      options: {
        repeat: {
          pattern: INSTAGRAM_TOKEN_REFRESH_CRON_PATTERN,
        },
      },
    });
  }
}
