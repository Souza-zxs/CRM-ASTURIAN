import { Test, type TestingModule } from '@nestjs/testing';

import { ConnectedAccountProvider } from 'zyra-shared/types';

import { ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import { WhatsappChannelEntity } from 'src/engine/metadata-modules/whatsapp-channel/entities/whatsapp-channel.entity';
import { getWorkspaceScopedRepositoryToken } from 'src/engine/zyra-orm/workspace-scoped-repository/get-workspace-scoped-repository-token.util';
import { MessagingMessageOutboundService } from 'src/modules/messaging/message-outbound-manager/services/messaging-message-outbound.service';
import { SendWhatsappMessageService } from 'src/modules/messaging/message-outbound-manager/services/send-whatsapp-message.service';
import { SentMessagePersistenceService } from 'src/modules/messaging/message-outbound-manager/services/sent-message-persistence.service';
import { WhatsappAgentManualSendHandoffService } from 'src/modules/whatsapp-agent/services/whatsapp-agent-manual-send-handoff.service';

describe('SendWhatsappMessageService', () => {
  let service: SendWhatsappMessageService;
  let messagingMessageOutboundService: { sendMessage: jest.Mock };
  let sentMessagePersistenceService: { persistSentMessage: jest.Mock };
  let connectedAccountRepository: { findOne: jest.Mock };
  let whatsappChannelRepository: { findOne: jest.Mock };
  let whatsappAgentManualSendHandoffService: {
    disableAiIfConversationExists: jest.Mock;
  };

  beforeEach(async () => {
    messagingMessageOutboundService = { sendMessage: jest.fn() };
    sentMessagePersistenceService = { persistSentMessage: jest.fn() };
    connectedAccountRepository = { findOne: jest.fn() };
    whatsappChannelRepository = { findOne: jest.fn() };
    whatsappAgentManualSendHandoffService = {
      disableAiIfConversationExists: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SendWhatsappMessageService,
        {
          provide: MessagingMessageOutboundService,
          useValue: messagingMessageOutboundService,
        },
        {
          provide: SentMessagePersistenceService,
          useValue: sentMessagePersistenceService,
        },
        {
          provide: getWorkspaceScopedRepositoryToken(ConnectedAccountEntity),
          useValue: connectedAccountRepository,
        },
        {
          provide: getWorkspaceScopedRepositoryToken(WhatsappChannelEntity),
          useValue: whatsappChannelRepository,
        },
        {
          provide: WhatsappAgentManualSendHandoffService,
          useValue: whatsappAgentManualSendHandoffService,
        },
      ],
    }).compile();

    service = module.get<SendWhatsappMessageService>(
      SendWhatsappMessageService,
    );
  });

  it('sends and persists the message, returning success', async () => {
    connectedAccountRepository.findOne.mockResolvedValue({
      id: 'connected-account-1',
      provider: ConnectedAccountProvider.WHATSAPP,
      handle: '5511000000000',
    });
    whatsappChannelRepository.findOne.mockResolvedValue({
      id: 'whatsapp-channel-1',
      messageChannelId: 'message-channel-1',
    });
    messagingMessageOutboundService.sendMessage.mockResolvedValue({
      headerMessageId: 'wamid.123',
      messageExternalId: 'wamid.123',
    });

    const result = await service.sendWhatsappMessage(
      {
        connectedAccountId: 'connected-account-1',
        to: '5511999999999',
        body: 'Oi!',
      },
      { id: 'workspace-1' },
    );

    expect(result).toEqual({ success: true });
    expect(messagingMessageOutboundService.sendMessage).toHaveBeenCalledWith(
      expect.objectContaining({ to: '5511999999999', body: 'Oi!' }),
      expect.objectContaining({ id: 'connected-account-1' }),
    );
    expect(
      sentMessagePersistenceService.persistSentMessage,
    ).toHaveBeenCalledWith(
      expect.objectContaining({
        body: 'Oi!',
        recipients: { to: ['5511999999999'], cc: [], bcc: [] },
        messageChannelId: 'message-channel-1',
        parentThreadExternalId: '5511999999999',
        workspaceId: 'workspace-1',
      }),
    );
    expect(
      whatsappAgentManualSendHandoffService.disableAiIfConversationExists,
    ).toHaveBeenCalledWith({
      connectedAccountId: 'connected-account-1',
      contactPhoneNumber: '5511999999999',
      workspaceId: 'workspace-1',
    });
  });

  it('returns a typed error when the outbound send fails (e.g. 24h window closed)', async () => {
    connectedAccountRepository.findOne.mockResolvedValue({
      id: 'connected-account-1',
      provider: ConnectedAccountProvider.WHATSAPP,
      handle: '5511000000000',
    });
    whatsappChannelRepository.findOne.mockResolvedValue({
      id: 'whatsapp-channel-1',
      messageChannelId: 'message-channel-1',
    });
    messagingMessageOutboundService.sendMessage.mockRejectedValue(
      new Error('Re-engagement message outside allowed window'),
    );

    const result = await service.sendWhatsappMessage(
      {
        connectedAccountId: 'connected-account-1',
        to: '5511999999999',
        body: 'Oi!',
      },
      { id: 'workspace-1' },
    );

    expect(result).toEqual({
      success: false,
      error: 'Re-engagement message outside allowed window',
    });
    expect(
      sentMessagePersistenceService.persistSentMessage,
    ).not.toHaveBeenCalled();
  });

  it('returns a typed error when the connected account is not found in the workspace', async () => {
    connectedAccountRepository.findOne.mockResolvedValue(null);

    const result = await service.sendWhatsappMessage(
      { connectedAccountId: 'missing', to: '5511999999999', body: 'Oi!' },
      { id: 'workspace-1' },
    );

    expect(result).toEqual({
      success: false,
      error: 'Connected account not found',
    });
    expect(messagingMessageOutboundService.sendMessage).not.toHaveBeenCalled();
  });
});
