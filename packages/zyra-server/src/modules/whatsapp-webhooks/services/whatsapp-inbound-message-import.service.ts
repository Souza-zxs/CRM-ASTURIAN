import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';
import { FieldActorSource, MessageParticipantRole } from 'zyra-shared/types';
import { isDefined } from 'zyra-shared/utils';

import { ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import { MessageChannelEntity } from 'src/engine/metadata-modules/message-channel/entities/message-channel.entity';
import { GlobalWorkspaceOrmManager } from 'src/engine/zyra-orm/global-workspace-datasource/global-workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/zyra-orm/utils/build-system-auth-context.util';
import { MessageDirection } from 'src/modules/messaging/common/enums/message-direction.enum';
import { type MessageWithParticipants } from 'src/modules/messaging/message-import-manager/types/message';
import { MessagingSaveMessagesAndEnqueueContactCreationService } from 'src/modules/messaging/message-import-manager/services/messaging-save-messages-and-enqueue-contact-creation.service';
import { WhatsappChannelEntity } from 'src/engine/metadata-modules/whatsapp-channel/entities/whatsapp-channel.entity';
import { WhatsappAgentTriggerService } from 'src/modules/whatsapp-agent/services/whatsapp-agent-trigger.service';
import { type WhatsappWebhookChangeValue } from 'src/modules/whatsapp-webhooks/types/whatsapp-webhook-payload.type';

@Injectable()
export class WhatsappInboundMessageImportService {
  private readonly logger = new Logger(
    WhatsappInboundMessageImportService.name,
  );

  constructor(
    private readonly messagingSaveMessagesAndEnqueueContactCreationService: MessagingSaveMessagesAndEnqueueContactCreationService,
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
    private readonly whatsappAgentTriggerService: WhatsappAgentTriggerService,
    // Looked up by phoneNumberId alone — the whole point of this query is to
    // discover which workspace this inbound webhook belongs to, so no
    // workspaceId is available yet to scope it by.
    // eslint-disable-next-line zyra/prefer-workspace-scoped-repository
    @InjectRepository(WhatsappChannelEntity)
    private readonly whatsappChannelRepository: Repository<WhatsappChannelEntity>,
    @InjectRepository(MessageChannelEntity)
    private readonly messageChannelRepository: Repository<MessageChannelEntity>,
    @InjectRepository(ConnectedAccountEntity)
    private readonly connectedAccountRepository: Repository<ConnectedAccountEntity>,
  ) {}

  async importChange(changeValue: WhatsappWebhookChangeValue): Promise<void> {
    const messages = changeValue.messages ?? [];

    if (messages.length === 0) {
      // Delivery/read status callbacks land here too — nothing to import.
      return;
    }

    const { phone_number_id: phoneNumberId } = changeValue.metadata;

    const whatsappChannel = await this.whatsappChannelRepository.findOne({
      where: { phoneNumberId },
    });

    if (!isDefined(whatsappChannel)) {
      this.logger.warn(
        `Received a WhatsApp webhook for unknown phone_number_id ${phoneNumberId}`,
      );

      return;
    }

    const { workspaceId } = whatsappChannel;

    const [messageChannel, connectedAccount] = await Promise.all([
      this.messageChannelRepository.findOne({
        where: { id: whatsappChannel.messageChannelId, workspaceId },
      }),
      this.connectedAccountRepository.findOne({
        where: { id: whatsappChannel.connectedAccountId, workspaceId },
      }),
    ]);

    if (!isDefined(messageChannel) || !isDefined(connectedAccount)) {
      this.logger.error(
        `WhatsApp channel ${whatsappChannel.id} is missing its message channel or connected account`,
      );

      return;
    }

    const contactNameByWaId = new Map(
      (changeValue.contacts ?? []).map((contact) => [
        contact.wa_id,
        contact.profile.name,
      ]),
    );

    for (const message of messages) {
      if (message.type !== 'text' || !isDefined(message.text)) {
        this.logger.warn(
          `Dropping unsupported inbound WhatsApp message type "${message.type}" (id ${message.id}) — only text messages are imported`,
        );
      }
    }

    const messagesToSave: MessageWithParticipants[] = messages
      .filter((message) => message.type === 'text' && isDefined(message.text))
      .map((message) => {
        // One WhatsApp chat with a contact is modeled as one ongoing thread —
        // the external thread id is just the other party's phone number.
        const threadExternalId = message.from;

        return {
          headerMessageId: message.id,
          subject: '',
          text: message.text?.body ?? '',
          receivedAt: new Date(Number(message.timestamp) * 1000),
          attachments: [],
          externalId: message.id,
          messageThreadExternalId: threadExternalId,
          direction: MessageDirection.INCOMING,
          participants: [
            {
              role: MessageParticipantRole.FROM,
              handle: message.from,
              displayName: contactNameByWaId.get(message.from) ?? message.from,
            },
            {
              role: MessageParticipantRole.TO,
              handle: whatsappChannel.displayPhoneNumber,
              displayName: whatsappChannel.displayPhoneNumber,
            },
          ],
        };
      });

    if (messagesToSave.length === 0) {
      return;
    }

    await this.globalWorkspaceOrmManager.executeInWorkspaceContext(
      async () => {
        await this.messagingSaveMessagesAndEnqueueContactCreationService.saveMessagesAndEnqueueContactCreation(
          messagesToSave,
          messageChannel,
          connectedAccount,
          workspaceId,
          FieldActorSource.WHATSAPP,
        );
      },
      buildSystemAuthContext(workspaceId),
      { lite: true },
    );

    // Give the AI agent (if any is configured and active for this channel) a
    // chance to reply — a no-op unless WhatsappAgentEntity exists for this
    // channel. Runs after the CRM-inbox save above so the inbound message is
    // always visible to a human regardless of what the agent does with it.
    for (const message of messagesToSave) {
      if (!isDefined(message.text) || message.text.length === 0) {
        continue;
      }

      await this.whatsappAgentTriggerService.enqueueIncomingMessage({
        workspaceId,
        whatsappChannelId: whatsappChannel.id,
        contactPhoneNumber: message.messageThreadExternalId,
        text: message.text,
      });
    }
  }
}
