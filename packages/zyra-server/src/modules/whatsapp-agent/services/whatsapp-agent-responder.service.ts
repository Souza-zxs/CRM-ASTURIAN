import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';
import { isDefined } from 'zyra-shared/utils';

import { ZyraConfigService } from 'src/engine/core-modules/zyra-config/zyra-config.service';
import { ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import { WhatsappAgentConversationEntity } from 'src/engine/metadata-modules/whatsapp-agent/entities/whatsapp-agent-conversation.entity';
import { WhatsappAgentMessageEntity } from 'src/engine/metadata-modules/whatsapp-agent/entities/whatsapp-agent-message.entity';
import { WhatsappAgentEntity } from 'src/engine/metadata-modules/whatsapp-agent/entities/whatsapp-agent.entity';
import { WhatsappAgentMessageDirection } from 'src/engine/metadata-modules/whatsapp-agent/types/whatsapp-agent-message-direction.enum';
import { WhatsappChannelEntity } from 'src/engine/metadata-modules/whatsapp-channel/entities/whatsapp-channel.entity';
import { InjectWorkspaceScopedRepository } from 'src/engine/zyra-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/zyra-orm/workspace-scoped-repository/workspace-scoped-repository';
import { MessagingMessageOutboundService } from 'src/modules/messaging/message-outbound-manager/services/messaging-message-outbound.service';
import { SentMessagePersistenceService } from 'src/modules/messaging/message-outbound-manager/services/sent-message-persistence.service';
import { type SendMessageResult } from 'src/modules/messaging/message-outbound-manager/types/send-message-result.type';
import { WhatsappAgentInstructionsBuilderService } from 'src/modules/whatsapp-agent/services/whatsapp-agent-instructions-builder.service';
import { WhatsappAgentOpenAiClientService } from 'src/modules/whatsapp-agent/services/whatsapp-agent-openai-client.service';

export type WhatsappAgentRespondInput = {
  workspaceId: string;
  whatsappAgentId: string;
  contactPhoneNumber: string;
  text: string;
};

// Only the last N messages of the agent's own short history are sent back to
// OpenAI as context — enough to keep the conversation coherent without
// letting the prompt grow unbounded.
const MAX_HISTORY_MESSAGES = 20;

// The brain of the WhatsApp AI agent: given one new inbound message, decides
// whether/how to reply. Runs entirely inside a BullMQ job (see
// WhatsappAgentResponderJob) — no GraphQL/HTTP request context is available
// here, but WhatsappAgentTriggerService already resolved workspaceId before
// enqueueing, so every workspace-scoped entity below still goes through
// WorkspaceScopedRepository like a normal request would.
@Injectable()
export class WhatsappAgentResponderService {
  private readonly logger = new Logger(WhatsappAgentResponderService.name);

  constructor(
    @InjectWorkspaceScopedRepository(WhatsappAgentEntity)
    private readonly whatsappAgentRepository: WorkspaceScopedRepository<WhatsappAgentEntity>,
    @InjectWorkspaceScopedRepository(WhatsappChannelEntity)
    private readonly whatsappChannelRepository: WorkspaceScopedRepository<WhatsappChannelEntity>,
    // ConnectedAccountEntity is exempt from the workspace-scoped wrapper
    // (see zyra-oxlint-rules prefer-workspace-scoped-repository EXCLUSIONS) —
    // same plain-repository pattern WhatsappMessageOutboundService itself uses.
    @InjectRepository(ConnectedAccountEntity)
    private readonly connectedAccountRepository: Repository<ConnectedAccountEntity>,
    @InjectWorkspaceScopedRepository(WhatsappAgentConversationEntity)
    private readonly conversationRepository: WorkspaceScopedRepository<WhatsappAgentConversationEntity>,
    @InjectWorkspaceScopedRepository(WhatsappAgentMessageEntity)
    private readonly messageRepository: WorkspaceScopedRepository<WhatsappAgentMessageEntity>,
    private readonly zyraConfigService: ZyraConfigService,
    private readonly instructionsBuilderService: WhatsappAgentInstructionsBuilderService,
    private readonly openAiClientService: WhatsappAgentOpenAiClientService,
    private readonly messagingMessageOutboundService: MessagingMessageOutboundService,
    private readonly sentMessagePersistenceService: SentMessagePersistenceService,
  ) {}

  async respond({
    workspaceId,
    whatsappAgentId,
    contactPhoneNumber,
    text,
  }: WhatsappAgentRespondInput): Promise<void> {
    const whatsappAgent = await this.whatsappAgentRepository.findOne(
      workspaceId,
      { where: { id: whatsappAgentId } },
    );

    // Agent may have been deleted/deactivated between enqueue and now — the
    // inbound message itself was already saved to the CRM inbox regardless.
    if (!isDefined(whatsappAgent) || !whatsappAgent.isActive) {
      return;
    }

    const conversation = await this.findOrCreateConversation(
      whatsappAgent,
      contactPhoneNumber,
    );

    if (!conversation.isAiEnabled) {
      // A human already took over this conversation — never auto-reply again
      // until it's explicitly re-enabled from the CRM.
      return;
    }

    await this.messageRepository.save(workspaceId, {
      conversationId: conversation.id,
      direction: WhatsappAgentMessageDirection.INBOUND,
      content: text,
    });

    const isWhatsappAiAgentEnabled = this.zyraConfigService.get(
      'IS_WHATSAPP_AI_AGENT_ENABLED',
    );
    const openAiApiKey = this.zyraConfigService.get('OPENAI_API_KEY');

    if (!isWhatsappAiAgentEnabled || !isDefined(openAiApiKey)) {
      this.logger.warn(
        `Whatsapp AI agent ${whatsappAgent.id} is disabled or OPENAI_API_KEY is not configured — the inbound message was saved but no automated reply will be sent`,
      );

      return;
    }

    const recentMessages = await this.messageRepository.find(workspaceId, {
      where: { conversationId: conversation.id },
      order: { createdAt: 'DESC' },
      take: MAX_HISTORY_MESSAGES,
    });
    const history = recentMessages.reverse().map((message) => ({
      direction: message.direction,
      content: message.content,
    }));

    const instructions =
      this.instructionsBuilderService.buildInstructions(whatsappAgent);

    const qualification = await this.openAiClientService.getQualifiedReply({
      apiKey: openAiApiKey,
      model: whatsappAgent.model,
      instructions,
      contactPhoneNumber,
      history,
    });

    if (!isDefined(qualification)) {
      // Already logged by WhatsappAgentOpenAiClientService — nothing more to
      // do, the inbound message stays visible in the CRM inbox for a human.
      return;
    }

    await this.messageRepository.save(workspaceId, {
      conversationId: conversation.id,
      direction: WhatsappAgentMessageDirection.OUTBOUND,
      content: qualification.reply,
    });

    await this.conversationRepository.update(
      workspaceId,
      { id: conversation.id },
      {
        qualificationSummary: qualification.summary || null,
        lastMessageAt: new Date(),
        // Once the model itself asks for a human handoff, stop auto-replying
        // — otherwise the agent could keep talking after telling the contact
        // it's transferring them.
        ...(qualification.wantsHumanHandoff ? { isAiEnabled: false } : {}),
      },
    );

    await this.sendReply(
      whatsappAgent,
      contactPhoneNumber,
      qualification.reply,
    );
  }

  private async findOrCreateConversation(
    whatsappAgent: WhatsappAgentEntity,
    contactPhoneNumber: string,
  ): Promise<WhatsappAgentConversationEntity> {
    const existingConversation = await this.conversationRepository.findOne(
      whatsappAgent.workspaceId,
      { where: { whatsappAgentId: whatsappAgent.id, contactPhoneNumber } },
    );

    if (isDefined(existingConversation)) {
      return existingConversation;
    }

    return this.conversationRepository.save(whatsappAgent.workspaceId, {
      whatsappAgentId: whatsappAgent.id,
      contactPhoneNumber,
      isAiEnabled: true,
    });
  }

  // Sends the reply via the "official" outbound pipeline
  // (MessagingMessageOutboundService + SentMessagePersistenceService) rather
  // than calling WhatsappGraphApiService directly — both services are plain
  // injectables that build their own system/workspace auth context
  // internally (see SentMessagePersistenceService ->
  // MessagingSaveMessagesAndEnqueueContactCreationService), so they're safe
  // to call from this background job with no ambient GraphQL/HTTP request.
  // The upside over calling the Graph API directly: the reply is persisted
  // into the CRM inbox, so a human sees the whole conversation including the
  // agent's replies.
  private async sendReply(
    whatsappAgent: WhatsappAgentEntity,
    contactPhoneNumber: string,
    replyText: string,
  ): Promise<void> {
    const whatsappChannel = await this.whatsappChannelRepository.findOne(
      whatsappAgent.workspaceId,
      { where: { id: whatsappAgent.whatsappChannelId } },
    );

    if (!isDefined(whatsappChannel)) {
      this.logger.error(
        `Whatsapp channel ${whatsappAgent.whatsappChannelId} not found — cannot send automated reply for agent ${whatsappAgent.id}`,
      );

      return;
    }

    const connectedAccount = await this.connectedAccountRepository.findOne({
      where: {
        id: whatsappChannel.connectedAccountId,
        workspaceId: whatsappChannel.workspaceId,
      },
    });

    if (!isDefined(connectedAccount)) {
      this.logger.error(
        `Connected account ${whatsappChannel.connectedAccountId} not found — cannot send automated reply for agent ${whatsappAgent.id}`,
      );

      return;
    }

    let sendResult: SendMessageResult;

    try {
      // subject/html are dead weight for WhatsApp — SendMessageInput is
      // shaped for email and the WhatsApp driver ignores both.
      sendResult = await this.messagingMessageOutboundService.sendMessage(
        { to: contactPhoneNumber, body: replyText, subject: '', html: '' },
        connectedAccount,
      );
    } catch (error) {
      this.logger.error(
        `Failed to send automated WhatsApp reply via ${whatsappChannel.phoneNumberId}: ${error instanceof Error ? error.message : String(error)}`,
      );

      return;
    }

    try {
      await this.sentMessagePersistenceService.persistSentMessage({
        sendResult,
        subject: '',
        body: replyText,
        recipients: { to: [contactPhoneNumber], cc: [], bcc: [] },
        connectedAccount: {
          id: connectedAccount.id,
          handle: connectedAccount.handle,
        },
        messageChannelId: whatsappChannel.messageChannelId,
        workspaceId: whatsappChannel.workspaceId,
        // Mirrors WhatsappInboundMessageImportService's thread key (the other
        // party's phone number) — without this, resolveOutboundThreadExternalId
        // falls back to the Graph API message id and every automated reply
        // would land in its own one-off thread instead of the existing
        // conversation.
        parentThreadExternalId: contactPhoneNumber,
      });
    } catch (persistenceError) {
      // Unlike email (recoverable via periodic mailbox sync), WhatsApp has
      // no polling sync — a failed persist here permanently loses this
      // message from the CRM inbox even though it was actually delivered.
      // Logged as an error (not a warning) for that reason; the message is
      // not resent since resending would duplicate it on the contact's side.
      this.logger.error(
        `Sent automated WhatsApp reply for agent ${whatsappAgent.id} but failed to persist it into the CRM inbox: ${persistenceError instanceof Error ? persistenceError.message : String(persistenceError)}`,
      );
    }
  }
}
