import { Test, type TestingModule } from '@nestjs/testing';

import { WhatsappAgentConversationEntity } from 'src/engine/metadata-modules/whatsapp-agent/entities/whatsapp-agent-conversation.entity';
import { WhatsappAgentEntity } from 'src/engine/metadata-modules/whatsapp-agent/entities/whatsapp-agent.entity';
import { WhatsappAgentConversationMetadataService } from 'src/engine/metadata-modules/whatsapp-agent/whatsapp-agent-conversation-metadata.service';
import { WhatsappChannelEntity } from 'src/engine/metadata-modules/whatsapp-channel/entities/whatsapp-channel.entity';
import { getWorkspaceScopedRepositoryToken } from 'src/engine/zyra-orm/workspace-scoped-repository/get-workspace-scoped-repository-token.util';
import { WhatsappAgentManualSendHandoffService } from 'src/modules/whatsapp-agent/services/whatsapp-agent-manual-send-handoff.service';

describe('WhatsappAgentManualSendHandoffService', () => {
  let service: WhatsappAgentManualSendHandoffService;
  let whatsappChannelRepository: { findOne: jest.Mock };
  let whatsappAgentRepository: { findOne: jest.Mock };
  let whatsappAgentConversationRepository: { findOne: jest.Mock };
  let whatsappAgentConversationMetadataService: { setAiEnabled: jest.Mock };

  const params = {
    connectedAccountId: 'connected-account-1',
    contactPhoneNumber: '5511999999999',
    workspaceId: 'workspace-1',
  };

  beforeEach(async () => {
    whatsappChannelRepository = { findOne: jest.fn() };
    whatsappAgentRepository = { findOne: jest.fn() };
    whatsappAgentConversationRepository = { findOne: jest.fn() };
    whatsappAgentConversationMetadataService = { setAiEnabled: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WhatsappAgentManualSendHandoffService,
        {
          provide: getWorkspaceScopedRepositoryToken(WhatsappChannelEntity),
          useValue: whatsappChannelRepository,
        },
        {
          provide: getWorkspaceScopedRepositoryToken(WhatsappAgentEntity),
          useValue: whatsappAgentRepository,
        },
        {
          provide: getWorkspaceScopedRepositoryToken(
            WhatsappAgentConversationEntity,
          ),
          useValue: whatsappAgentConversationRepository,
        },
        {
          provide: WhatsappAgentConversationMetadataService,
          useValue: whatsappAgentConversationMetadataService,
        },
      ],
    }).compile();

    service = module.get<WhatsappAgentManualSendHandoffService>(
      WhatsappAgentManualSendHandoffService,
    );
  });

  it('disables the AI when a matching agent conversation exists', async () => {
    whatsappChannelRepository.findOne.mockResolvedValue({ id: 'channel-1' });
    whatsappAgentRepository.findOne.mockResolvedValue({ id: 'agent-1' });
    whatsappAgentConversationRepository.findOne.mockResolvedValue({
      id: 'conversation-1',
    });

    await service.disableAiIfConversationExists(params);

    expect(
      whatsappAgentConversationMetadataService.setAiEnabled,
    ).toHaveBeenCalledWith({
      id: 'conversation-1',
      isAiEnabled: false,
      workspaceId: 'workspace-1',
    });
  });

  it('does nothing when there is no WhatsApp channel for the connected account', async () => {
    whatsappChannelRepository.findOne.mockResolvedValue(null);

    await service.disableAiIfConversationExists(params);

    expect(
      whatsappAgentConversationMetadataService.setAiEnabled,
    ).not.toHaveBeenCalled();
  });

  it('does nothing when there is no agent for the channel', async () => {
    whatsappChannelRepository.findOne.mockResolvedValue({ id: 'channel-1' });
    whatsappAgentRepository.findOne.mockResolvedValue(null);

    await service.disableAiIfConversationExists(params);

    expect(
      whatsappAgentConversationMetadataService.setAiEnabled,
    ).not.toHaveBeenCalled();
  });

  it('does nothing when there is no conversation row yet for this contact', async () => {
    whatsappChannelRepository.findOne.mockResolvedValue({ id: 'channel-1' });
    whatsappAgentRepository.findOne.mockResolvedValue({ id: 'agent-1' });
    whatsappAgentConversationRepository.findOne.mockResolvedValue(null);

    await service.disableAiIfConversationExists(params);

    expect(
      whatsappAgentConversationMetadataService.setAiEnabled,
    ).not.toHaveBeenCalled();
  });
});
