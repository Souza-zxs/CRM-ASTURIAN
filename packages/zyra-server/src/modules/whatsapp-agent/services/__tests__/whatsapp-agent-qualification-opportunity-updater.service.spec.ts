import { Test, type TestingModule } from '@nestjs/testing';

import { GlobalWorkspaceOrmManager } from 'src/engine/zyra-orm/global-workspace-datasource/global-workspace-orm.manager';
import { WhatsappAgentQualificationOpportunityUpdaterService } from 'src/modules/whatsapp-agent/services/whatsapp-agent-qualification-opportunity-updater.service';

describe('WhatsappAgentQualificationOpportunityUpdaterService', () => {
  let service: WhatsappAgentQualificationOpportunityUpdaterService;
  let globalWorkspaceOrmManager: { getRepository: jest.Mock };
  let personQueryBuilder: {
    select: jest.Mock;
    where: jest.Mock;
    andWhere: jest.Mock;
    orWhere: jest.Mock;
    withDeleted: jest.Mock;
    getMany: jest.Mock;
  };
  let personRepository: { createQueryBuilder: jest.Mock };
  let opportunityRepository: { findOne: jest.Mock; update: jest.Mock };

  const params = {
    workspaceId: 'workspace-1',
    contactPhoneNumber: '5511999999999',
    stage: 'PROPOSAL',
  };

  beforeEach(async () => {
    personQueryBuilder = {
      select: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      orWhere: jest.fn().mockReturnThis(),
      withDeleted: jest.fn().mockReturnThis(),
      getMany: jest.fn(),
    };
    personRepository = {
      createQueryBuilder: jest.fn().mockReturnValue(personQueryBuilder),
    };
    opportunityRepository = { findOne: jest.fn(), update: jest.fn() };

    globalWorkspaceOrmManager = {
      getRepository: jest.fn((_workspaceId: string, objectName: string) =>
        objectName === 'person' ? personRepository : opportunityRepository,
      ),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WhatsappAgentQualificationOpportunityUpdaterService,
        {
          provide: GlobalWorkspaceOrmManager,
          useValue: globalWorkspaceOrmManager,
        },
      ],
    }).compile();

    service = module.get<WhatsappAgentQualificationOpportunityUpdaterService>(
      WhatsappAgentQualificationOpportunityUpdaterService,
    );
  });

  it('advances the most recent opportunity to the qualified stage', async () => {
    personQueryBuilder.getMany.mockResolvedValue([
      {
        id: 'person-1',
        phones: { primaryPhoneNumber: '11999999999', additionalPhones: null },
      },
    ]);
    opportunityRepository.findOne.mockResolvedValue({
      id: 'opportunity-1',
      stage: 'SCREENING',
    });

    await service.advanceOpportunityStageFromQualification(params);

    expect(opportunityRepository.findOne).toHaveBeenCalledWith({
      where: { pointOfContactId: 'person-1' },
      order: { createdAt: 'DESC' },
    });
    expect(opportunityRepository.update).toHaveBeenCalledWith(
      'opportunity-1',
      { stage: 'PROPOSAL' },
    );
  });

  it('does nothing when no person matches the contact phone number', async () => {
    personQueryBuilder.getMany.mockResolvedValue([]);

    await service.advanceOpportunityStageFromQualification(params);

    expect(opportunityRepository.findOne).not.toHaveBeenCalled();
    expect(opportunityRepository.update).not.toHaveBeenCalled();
  });

  it('does nothing when the person has no opportunity', async () => {
    personQueryBuilder.getMany.mockResolvedValue([
      {
        id: 'person-1',
        phones: { primaryPhoneNumber: '11999999999', additionalPhones: null },
      },
    ]);
    opportunityRepository.findOne.mockResolvedValue(null);

    await service.advanceOpportunityStageFromQualification(params);

    expect(opportunityRepository.update).not.toHaveBeenCalled();
  });

  it('does not move the opportunity backward', async () => {
    personQueryBuilder.getMany.mockResolvedValue([
      {
        id: 'person-1',
        phones: { primaryPhoneNumber: '11999999999', additionalPhones: null },
      },
    ]);
    opportunityRepository.findOne.mockResolvedValue({
      id: 'opportunity-1',
      stage: 'PROPOSAL',
    });

    await service.advanceOpportunityStageFromQualification({
      ...params,
      stage: 'NEW',
    });

    expect(opportunityRepository.update).not.toHaveBeenCalled();
  });

  it('never throws when the repository lookup fails unexpectedly', async () => {
    globalWorkspaceOrmManager.getRepository.mockRejectedValueOnce(
      new Error('connection lost'),
    );

    await expect(
      service.advanceOpportunityStageFromQualification(params),
    ).resolves.toBeUndefined();
  });
});
