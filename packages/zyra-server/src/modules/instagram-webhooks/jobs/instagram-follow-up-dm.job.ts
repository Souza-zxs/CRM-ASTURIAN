import { Scope } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import { ConnectedAccountTokenEncryptionService } from 'src/engine/metadata-modules/connected-account/services/connected-account-token-encryption.service';
import { InstagramChannelEntity } from 'src/engine/metadata-modules/instagram-channel/entities/instagram-channel.entity';
import { InstagramGraphApiService } from 'src/modules/instagram/services/instagram-graph-api.service';

export type InstagramFollowUpDmJobData = {
  instagramChannelId: string;
  recipientIgsid: string;
  message: string;
};

// Delayed BullMQ job (see InstagramCommentAutomationService.
// scheduleFollowUpIfConfigured) — not a polling cron. Sends via the
// standard Send API (recipient by IGSID) rather than another "private
// reply", since a private reply can only be used once per comment_id; see
// InstagramGraphApiService.sendDirectMessage for the documented messaging
// window limitation this implies.
@Processor({
  queueName: MessageQueue.instagramQueue,
  scope: Scope.REQUEST,
})
export class InstagramFollowUpDmJob {
  constructor(
    @InjectRepository(InstagramChannelEntity)
    private readonly instagramChannelRepository: Repository<InstagramChannelEntity>,
    @InjectRepository(ConnectedAccountEntity)
    private readonly connectedAccountRepository: Repository<ConnectedAccountEntity>,
    private readonly connectedAccountTokenEncryptionService: ConnectedAccountTokenEncryptionService,
    private readonly instagramGraphApiService: InstagramGraphApiService,
  ) {}

  @Process(InstagramFollowUpDmJob.name)
  async handle(data: InstagramFollowUpDmJobData): Promise<void> {
    const instagramChannel = await this.instagramChannelRepository.findOneBy({
      id: data.instagramChannelId,
    });

    if (!instagramChannel) {
      return;
    }

    const connectedAccount = await this.connectedAccountRepository.findOneBy({
      id: instagramChannel.connectedAccountId,
    });

    if (!connectedAccount || !connectedAccount.accessToken) {
      return;
    }

    const accessToken = this.connectedAccountTokenEncryptionService.decrypt({
      ciphertext: connectedAccount.accessToken,
      workspaceId: instagramChannel.workspaceId,
    });

    await this.instagramGraphApiService.sendDirectMessage(
      instagramChannel.igBusinessAccountId,
      accessToken,
      data.recipientIgsid,
      data.message,
    );
  }
}
