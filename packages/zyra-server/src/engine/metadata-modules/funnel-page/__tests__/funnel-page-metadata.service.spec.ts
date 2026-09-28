import { Test, type TestingModule } from '@nestjs/testing';

import { FunnelPageStatus, FunnelPageType } from 'zyra-shared/types';

import { FunnelLeadEntity } from 'src/engine/metadata-modules/funnel-page/entities/funnel-lead.entity';
import { FunnelPageEntity } from 'src/engine/metadata-modules/funnel-page/entities/funnel-page.entity';
import { FunnelPageMetadataService } from 'src/engine/metadata-modules/funnel-page/funnel-page-metadata.service';
import { FunnelLeadCrmSyncService } from 'src/engine/metadata-modules/funnel-page/services/funnel-lead-crm-sync.service';
import { getWorkspaceScopedRepositoryToken } from 'src/engine/zyra-orm/workspace-scoped-repository/get-workspace-scoped-repository-token.util';

const WORKSPACE_ID = 'f7a7d81f-b6b3-42f3-8bba-51e74e90af90';
const PAGE_ID = '11111111-1111-4111-8111-111111111111';

const workshopContent = {
  type: FunnelPageType.WORKSHOP as const,
  videoUrl: 'https://youtu.be/abc',
  chatEnabled: false,
  ctaLabel: 'Continuar',
  ctaRedirectSlug: 'vendas',
};

const existingWorkshopPage = {
  id: PAGE_ID,
  workspaceId: WORKSPACE_ID,
  type: FunnelPageType.WORKSHOP,
  slug: 'workshop',
  status: FunnelPageStatus.DRAFT,
  content: workshopContent,
  seoTitle: null,
  seoDescription: null,
} as FunnelPageEntity;

describe('FunnelPageMetadataService', () => {
  let service: FunnelPageMetadataService;
  const funnelPageRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };
  const funnelLeadRepository = {
    findOne: jest.fn(),
    save: jest.fn(),
  };
  const funnelLeadCrmSyncService = {
    syncLeadToCrm: jest.fn(),
    markLeadAsAttendee: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FunnelPageMetadataService,
        {
          provide: getWorkspaceScopedRepositoryToken(FunnelPageEntity),
          useValue: funnelPageRepository,
        },
        {
          provide: getWorkspaceScopedRepositoryToken(FunnelLeadEntity),
          useValue: funnelLeadRepository,
        },
        {
          provide: FunnelLeadCrmSyncService,
          useValue: funnelLeadCrmSyncService,
        },
      ],
    }).compile();

    service = module.get(FunnelPageMetadataService);
  });

  describe('create', () => {
    it('should save the page when content.type matches type', async () => {
      funnelPageRepository.save.mockResolvedValue(existingWorkshopPage);

      await service.create({
        workspaceId: WORKSPACE_ID,
        input: {
          type: FunnelPageType.WORKSHOP,
          slug: 'workshop',
          content: workshopContent,
        },
      });

      expect(funnelPageRepository.save).toHaveBeenCalledWith(
        WORKSPACE_ID,
        expect.objectContaining({ type: FunnelPageType.WORKSHOP }),
      );
    });

    it('should reject content whose type does not match the page type', async () => {
      await expect(
        service.create({
          workspaceId: WORKSPACE_ID,
          input: {
            type: FunnelPageType.SALES,
            slug: 'vendas',
            content: workshopContent,
          },
        }),
      ).rejects.toThrow(
        'Funnel page content type "WORKSHOP" does not match page type "SALES"',
      );
      expect(funnelPageRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('should reject content whose type does not match the existing page type', async () => {
      funnelPageRepository.findOne.mockResolvedValue(existingWorkshopPage);

      await expect(
        service.update({
          id: PAGE_ID,
          workspaceId: WORKSPACE_ID,
          input: {
            id: PAGE_ID,
            content: {
              type: FunnelPageType.SALES,
              headline: '',
              valueStack: [],
              price: '',
              guaranteeText: '',
              faq: [],
              ctaLabel: '',
              checkoutUrl: '',
            },
          },
        }),
      ).rejects.toThrow(
        'Funnel page content type "SALES" does not match page type "WORKSHOP"',
      );
      expect(funnelPageRepository.update).not.toHaveBeenCalled();
    });

    it('should allow updating fields without resending content', async () => {
      funnelPageRepository.findOne.mockResolvedValue(existingWorkshopPage);

      await service.update({
        id: PAGE_ID,
        workspaceId: WORKSPACE_ID,
        input: { id: PAGE_ID, seoTitle: 'Novo título' },
      });

      expect(funnelPageRepository.update).toHaveBeenCalledWith(
        WORKSPACE_ID,
        { id: PAGE_ID },
        expect.objectContaining({ seoTitle: 'Novo título' }),
      );
    });
  });

  describe('publish', () => {
    it('should reject publishing a page missing required content fields', async () => {
      funnelPageRepository.findOne.mockResolvedValue({
        ...existingWorkshopPage,
        content: { ...workshopContent, videoUrl: '' },
      });

      await expect(
        service.publish({ id: PAGE_ID, workspaceId: WORKSPACE_ID }),
      ).rejects.toThrow('videoUrl');
      expect(funnelPageRepository.update).not.toHaveBeenCalled();
    });

    it('should publish a page whose required content fields are all filled in', async () => {
      funnelPageRepository.findOne.mockResolvedValue(existingWorkshopPage);

      await service.publish({ id: PAGE_ID, workspaceId: WORKSPACE_ID });

      expect(funnelPageRepository.update).toHaveBeenCalledWith(
        WORKSPACE_ID,
        { id: PAGE_ID },
        expect.objectContaining({ status: FunnelPageStatus.PUBLISHED }),
      );
    });
  });
});
