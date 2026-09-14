import { Command, CommandRunner } from 'nest-commander';

import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import {
  INSTAGRAM_FOLLOWER_SNAPSHOT_CRON_PATTERN,
  InstagramFollowerSnapshotCronJob,
} from 'src/modules/instagram-crons/crons/jobs/instagram-follower-snapshot.cron.job';

@Command({
  name: 'cron:instagram:follower-snapshot',
  description:
    'Starts a cron job that records a daily follower-count snapshot for every connected Instagram channel',
})
export class InstagramFollowerSnapshotCronCommand extends CommandRunner {
  constructor(
    @InjectMessageQueue(MessageQueue.cronQueue)
    private readonly messageQueueService: MessageQueueService,
  ) {
    super();
  }

  async run(): Promise<void> {
    await this.messageQueueService.addCron<undefined>({
      jobName: InstagramFollowerSnapshotCronJob.name,
      data: undefined,
      options: {
        repeat: {
          pattern: INSTAGRAM_FOLLOWER_SNAPSHOT_CRON_PATTERN,
        },
      },
    });
  }
}
