import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { In, Repository } from 'typeorm';
import { MessageChannelType, MessageParticipantRole } from 'zyra-shared/types';

import { MessageChannelEntity } from 'src/engine/metadata-modules/message-channel/entities/message-channel.entity';
import { GlobalWorkspaceOrmManager } from 'src/engine/zyra-orm/global-workspace-datasource/global-workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/zyra-orm/utils/build-system-auth-context.util';
import { type MessageWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message.workspace-entity';
import { type WhatsappConversationDTO } from 'src/modules/whatsapp-inbox/dtos/whatsapp-conversation.dto';

type ThreadChannelRow = {
  messageThreadId: string;
  messageChannelId: string | null;
  lastMessageReceivedAt: Date;
};

const normalizeHandle = (handle: string | null | undefined): string =>
  (handle ?? '').replace(/\D/g, '');

@Injectable()
export class WhatsappInboxService {
  constructor(
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
    @InjectRepository(MessageChannelEntity)
    private readonly messageChannelRepository: Repository<MessageChannelEntity>,
  ) {}

  // Maps each WhatsApp message channel id to its own number, so the contact
  // of a conversation can be told apart from the business number.
  private async getWhatsappChannelHandles(
    workspaceId: string,
  ): Promise<Map<string, string>> {
    const whatsappChannels = await this.messageChannelRepository.find({
      where: { workspaceId, type: MessageChannelType.WHATSAPP },
      select: { id: true, handle: true },
    });

    return new Map(
      whatsappChannels.map((channel) => [channel.id, channel.handle ?? '']),
    );
  }

  private async getThreadChannelRows(
    workspaceId: string,
    personIds?: string[],
  ): Promise<ThreadChannelRow[]> {
    const authContext = buildSystemAuthContext(workspaceId);

    return this.globalWorkspaceOrmManager.executeInWorkspaceContext(
      async () => {
        const messageThreadRepository =
          await this.globalWorkspaceOrmManager.getRepository(
            workspaceId,
            'messageThread',
          );

        let queryBuilder = messageThreadRepository
          .createQueryBuilder('messageThread')
          .select('messageThread.id', 'messageThreadId')
          .addSelect(
            'messageChannelMessageAssociation.messageChannelId',
            'messageChannelId',
          )
          .addSelect('MAX(messages.receivedAt)', 'lastMessageReceivedAt')
          .innerJoin('messageThread.messages', 'messages')
          .innerJoin(
            'messages.messageChannelMessageAssociations',
            'messageChannelMessageAssociation',
          );

        if (personIds !== undefined && personIds.length > 0) {
          queryBuilder = queryBuilder
            .innerJoin('messages.messageParticipants', 'messageParticipants')
            .where('messageParticipants.personId IN (:...personIds)', {
              personIds,
            });
        }

        return queryBuilder
          .groupBy('messageThread.id')
          .addGroupBy('messageChannelMessageAssociation.messageChannelId')
          .orderBy('"lastMessageReceivedAt"', 'DESC')
          .getRawMany<ThreadChannelRow>();
      },
      authContext,
    );
  }

  async getThreadIdForPerson(
    personId: string,
    workspaceId: string,
  ): Promise<string | null> {
    const [threadRows, whatsappChannelHandles] = await Promise.all([
      this.getThreadChannelRows(workspaceId, [personId]),
      this.getWhatsappChannelHandles(workspaceId),
    ]);

    const whatsappThreadRow = threadRows.find(
      (row) =>
        row.messageChannelId !== null &&
        whatsappChannelHandles.has(row.messageChannelId),
    );

    return whatsappThreadRow?.messageThreadId ?? null;
  }

  async getConversations(
    workspaceId: string,
  ): Promise<WhatsappConversationDTO[]> {
    const [threadRows, whatsappChannelHandles] = await Promise.all([
      this.getThreadChannelRows(workspaceId),
      this.getWhatsappChannelHandles(workspaceId),
    ]);

    const whatsappThreadRows = threadRows.filter(
      (row) =>
        row.messageChannelId !== null &&
        whatsappChannelHandles.has(row.messageChannelId),
    );

    if (whatsappThreadRows.length === 0) {
      return [];
    }

    const authContext = buildSystemAuthContext(workspaceId);
    const threadIds = whatsappThreadRows.map((row) => row.messageThreadId);

    const lastMessageByThreadId =
      await this.globalWorkspaceOrmManager.executeInWorkspaceContext(
        async () => {
          const messageRepository =
            await this.globalWorkspaceOrmManager.getRepository<MessageWorkspaceEntity>(
              workspaceId,
              'message',
            );

          const messages = await messageRepository.find({
            where: { messageThreadId: In(threadIds) },
            order: { receivedAt: 'DESC' },
            relations: { messageParticipants: true },
          });

          const byThreadId = new Map<string, (typeof messages)[number]>();

          for (const message of messages) {
            if (
              message.messageThreadId !== null &&
              !byThreadId.has(message.messageThreadId)
            ) {
              byThreadId.set(message.messageThreadId, message);
            }
          }

          return byThreadId;
        },
        authContext,
      );

    const conversations: WhatsappConversationDTO[] = [];

    for (const row of whatsappThreadRows) {
      const lastMessage = lastMessageByThreadId.get(row.messageThreadId);

      if (lastMessage === undefined) {
        continue;
      }

      const ownHandle = normalizeHandle(
        whatsappChannelHandles.get(row.messageChannelId as string),
      );

      // The last message may be one we sent (the contact is then the
      // recipient), so pick the participant that is not the business number,
      // preferring the sender of an inbound message.
      const participants = [...lastMessage.messageParticipants].sort(
        (a, b) =>
          Number(b.role === MessageParticipantRole.FROM) -
          Number(a.role === MessageParticipantRole.FROM),
      );
      const contactParticipant =
        participants.find(
          (participant) =>
            ownHandle === '' ||
            normalizeHandle(participant.handle) !== ownHandle,
        ) ?? participants[0];

      conversations.push({
        messageThreadId: row.messageThreadId,
        contactPhoneNumber: contactParticipant?.handle ?? '',
        contactDisplayName: contactParticipant?.displayName ?? '',
        personId: contactParticipant?.personId ?? null,
        lastMessageBody: lastMessage.text ?? '',
        lastMessageReceivedAt:
          lastMessage.receivedAt ?? row.lastMessageReceivedAt,
      });
    }

    return conversations.sort(
      (a, b) =>
        new Date(b.lastMessageReceivedAt).getTime() -
        new Date(a.lastMessageReceivedAt).getTime(),
    );
  }
}
