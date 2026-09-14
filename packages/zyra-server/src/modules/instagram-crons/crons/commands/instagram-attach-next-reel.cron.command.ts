import { Command, CommandRunner } from 'nest-commander';

import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import {
  INSTAGRAM_ATTACH_NEXT_REEL_CRON_PATTERN,
  InstagramAttachNextReelCronJob,
} from 'src/modules/instagram-crons/crons/jobs/instagram-attach-next-reel.cron.job';

@Command({
  name: 'cron:instagram:attach-next-reel',
  description:
    'Starts a cron job that attaches pending "attach to next Reel" automation rules to the channel\'s next published Reel',
})
export class InstagramAttachNextReelCronCommand extends CommandRunner {
  constructor(
    @InjectMessageQueue(MessageQueue.cronQueue)
    private readonly messageQueueService: MessageQueueService,
  ) {
    super();
  }

  async run(): Promise<void> {
    await this.messageQueueService.addCron<undefined>({
      jobName: InstagramAttachNextReelCronJob.name,
      data: undefined,
      options: {
        repeat: {
          pattern: INSTAGRAM_ATTACH_NEXT_REEL_CRON_PATTERN,
        },
      },
    });
  }
}
