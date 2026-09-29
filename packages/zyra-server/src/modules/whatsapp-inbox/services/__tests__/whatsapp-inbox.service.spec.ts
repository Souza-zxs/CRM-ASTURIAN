import { Test, type TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { MessageChannelType } from 'zyra-shared/types';

import { MessageChannelEntity } from 'src/engine/metadata-modules/message-channel/entities/message-channel.entity';
import { GlobalWorkspaceOrmManager } from 'src/engine/zyra-orm/global-workspace-datasource/global-workspace-orm.manager';
import { WhatsappInboxService } from 'src/modules/whatsapp-inbox/services/whatsapp-inbox.service';

const buildQueryBuilderMock = (rows: unknown[]) => ({
  select: jest.fn().mockReturnThis(),
  addSelect: jest.fn().mockReturnThis(),
  innerJoin: jest.fn().mockReturnThis(),
  where: jest.fn().mockReturnThis(),
  groupBy: jest.fn().mockReturnThis(),
  addGroupBy: jest.fn().mockReturnThis(),
  orderBy: jest.fn().mockReturnThis(),
  getRawMany: jest.fn().mockResolvedValue(rows),
});

describe('WhatsappInboxService', () => {
  let service: WhatsappInboxService;
  let messageChannelRepository: { find: jest.Mock };
  let globalWorkspaceOrmManager: {
    executeInWorkspaceContext: jest.Mock;
    getRepository: jest.Mock;
  };

  beforeEach(async () => {
    messageChannelRepository = { find: jest.fn() };
    globalWorkspaceOrmManager = {
      executeInWorkspaceContext: jest.fn((callback) => callback()),
      getRepository: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WhatsappInboxService,
        {
          provide: getRepositoryToken(MessageChannelEntity),
          useValue: messageChannelRepository,
        },
        {
          provide: GlobalWorkspaceOrmManager,
          useValue: globalWorkspaceOrmManager,
        },
      ],
    }).compile();

    service = module.get<WhatsappInboxService>(WhatsappInboxService);
  });

  describe('getThreadIdForPerson', () => {
    it('returns null when the person has no threads at all', async () => {
      globalWorkspaceOrmManager.getRepository.mockResolvedValue({
        createQueryBuilder: jest
          .fn()
          .mockReturnValue(buildQueryBuilderMock([])),
      });
      messageChannelRepository.find.mockResolvedValue([]);

      const result = await service.getThreadIdForPerson(
        'person-1',
        'workspace-1',
      );

      expect(result).toBeNull();
    });

    it('returns the most recent thread id whose channel is WHATSAPP', async () => {
      globalWorkspaceOrmManager.getRepository.mockResolvedValue({
        createQueryBuilder: jest.fn().mockReturnValue(
          buildQueryBuilderMock([
            {
              messageThreadId: 'thread-email-1',
              messageChannelId: 'channel-email-1',
              lastMessageReceivedAt: new Date('2026-09-20'),
            },
            {
              messageThreadId: 'thread-whatsapp-1',
              messageChannelId: 'channel-whatsapp-1',
              lastMessageReceivedAt: new Date('2026-09-27'),
            },
          ]),
        ),
      });
      // The repository query is already filtered by type WHATSAPP, so only
      // the WhatsApp channel comes back.
      messageChannelRepository.find.mockResolvedValue([
        {
          id: 'channel-whatsapp-1',
          type: MessageChannelType.WHATSAPP,
          handle: '5511000000000',
        },
      ]);

      const result = await service.getThreadIdForPerson(
        'person-1',
        'workspace-1',
      );

      expect(result).toBe('thread-whatsapp-1');
      expect(messageChannelRepository.find).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            workspaceId: 'workspace-1',
            type: MessageChannelType.WHATSAPP,
          },
        }),
      );
    });
  });
});
