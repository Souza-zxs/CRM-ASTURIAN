import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { NO_BILLING_SUBSCRIPTION } from 'src/engine/core-modules/billing/constants/no-billing-subscription.constant';
import { BillingSubscriptionItemEntity } from 'src/engine/core-modules/billing/entities/billing-subscription-item.entity';
import { SubscriptionStatus } from 'src/engine/core-modules/billing/enums/billing-subscription-status.enum';
import { WorkspaceModuleGrandfatherEntity } from 'src/engine/core-modules/plan-tier/entities/workspace-module-grandfather.entity';
import { PlanGatedFeature } from 'src/engine/core-modules/plan-tier/enums/plan-gated-feature.enum';
import { WorkspacePlanTier } from 'src/engine/core-modules/plan-tier/enums/workspace-plan-tier.enum';
import { WorkspacePlanTierService } from 'src/engine/core-modules/plan-tier/services/workspace-plan-tier.service';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { getWorkspaceScopedRepositoryToken } from 'src/engine/zyra-orm/workspace-scoped-repository/get-workspace-scoped-repository-token.util';

describe('WorkspacePlanTierService', () => {
  const findOneGrandfather = jest.fn();
  const findGrandfather = jest.fn();
  const saveGrandfather = jest.fn();
  const getOrRecompute = jest.fn();
  const createQueryBuilder = jest.fn();
  const getMany = jest.fn();

  const buildService = async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        WorkspacePlanTierService,
        {
          provide: WorkspaceCacheService,
          useValue: { getOrRecompute },
        },
        {
          provide: getWorkspaceScopedRepositoryToken(
            WorkspaceModuleGrandfatherEntity,
          ),
          useValue: {
            findOne: findOneGrandfather,
            find: findGrandfather,
            save: saveGrandfather,
          },
        },
        {
          provide: getRepositoryToken(BillingSubscriptionItemEntity),
          useValue: { createQueryBuilder },
        },
      ],
    }).compile();

    return moduleRef.get(WorkspacePlanTierService);
  };

  beforeEach(() => {
    findOneGrandfather.mockReset();
    findGrandfather.mockReset();
    saveGrandfather.mockReset();
    getOrRecompute.mockReset();
    getMany.mockReset();
    createQueryBuilder.mockReset().mockReturnValue({
      innerJoin: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      getMany,
    });
    getMany.mockResolvedValue([]);
  });

  describe('getWorkspacePlanTier', () => {
    it('returns PRO when an active subscription exists', async () => {
      getOrRecompute.mockResolvedValue({
        currentBillingSubscription: { status: SubscriptionStatus.Active },
      });
      findGrandfather.mockResolvedValue([]);

      const service = await buildService();

      expect(await service.getWorkspacePlanTier('workspace-1')).toBe(
        WorkspacePlanTier.PRO,
      );
    });

    it('returns PRO when at least one module is grandfathered, even with no subscription', async () => {
      getOrRecompute.mockResolvedValue({
        currentBillingSubscription: NO_BILLING_SUBSCRIPTION,
      });
      findGrandfather.mockResolvedValue([
        { workspaceId: 'workspace-1', module: PlanGatedFeature.WHATSAPP },
      ]);

      const service = await buildService();

      expect(await service.getWorkspacePlanTier('workspace-1')).toBe(
        WorkspacePlanTier.PRO,
      );
    });

    it('returns BASIC when neither an active subscription nor any grandfather row exists', async () => {
      getOrRecompute.mockResolvedValue({
        currentBillingSubscription: NO_BILLING_SUBSCRIPTION,
      });
      findGrandfather.mockResolvedValue([]);

      const service = await buildService();

      expect(await service.getWorkspacePlanTier('workspace-1')).toBe(
        WorkspacePlanTier.BASIC,
      );
    });

    it('returns BASIC when subscription exists but is canceled', async () => {
      getOrRecompute.mockResolvedValue({
        currentBillingSubscription: { status: SubscriptionStatus.Canceled },
      });
      findGrandfather.mockResolvedValue([]);

      const service = await buildService();

      expect(await service.getWorkspacePlanTier('workspace-1')).toBe(
        WorkspacePlanTier.BASIC,
      );
    });
  });

  describe('hasAccessToFeature / getModuleQuantity', () => {
    it('is false when the workspace has no base subscription at all, regardless of modules', async () => {
      getOrRecompute.mockResolvedValue({
        currentBillingSubscription: NO_BILLING_SUBSCRIPTION,
      });
      findGrandfather.mockResolvedValue([]);
      findOneGrandfather.mockResolvedValue({
        workspaceId: 'workspace-1',
        module: PlanGatedFeature.WHATSAPP,
      });

      const service = await buildService();

      expect(
        await service.hasAccessToFeature(
          'workspace-1',
          PlanGatedFeature.WHATSAPP,
        ),
      ).toBe(false);
    });

    it('is true when PRO and the specific module is grandfathered', async () => {
      getOrRecompute.mockResolvedValue({
        currentBillingSubscription: { status: SubscriptionStatus.Active },
      });
      findOneGrandfather.mockImplementation((_workspaceId, { where }) =>
        where.module === PlanGatedFeature.WHATSAPP
          ? Promise.resolve({ module: PlanGatedFeature.WHATSAPP })
          : Promise.resolve(null),
      );

      const service = await buildService();

      expect(
        await service.hasAccessToFeature(
          'workspace-1',
          PlanGatedFeature.WHATSAPP,
        ),
      ).toBe(true);
      expect(
        await service.hasAccessToFeature(
          'workspace-1',
          PlanGatedFeature.VOICE_AGENT,
        ),
      ).toBe(false);
    });

    it('is false when PRO but the specific module is neither grandfathered nor billed', async () => {
      getOrRecompute.mockResolvedValue({
        currentBillingSubscription: { status: SubscriptionStatus.Active },
      });
      findOneGrandfather.mockResolvedValue(null);
      getMany.mockResolvedValue([]);

      const service = await buildService();

      expect(
        await service.hasAccessToFeature(
          'workspace-1',
          PlanGatedFeature.WHATSAPP,
        ),
      ).toBe(false);
    });

    it('sums quantity across active subscription items for the module product', async () => {
      getOrRecompute.mockResolvedValue({
        currentBillingSubscription: { status: SubscriptionStatus.Active },
      });
      findOneGrandfather.mockResolvedValue(null);
      getMany.mockResolvedValue([{ quantity: 2 }, { quantity: null }]);

      const service = await buildService();

      // quantity: null defaults to 1 (a Stripe line item with no explicit
      // quantity still represents one unit of the product).
      expect(
        await service.getModuleQuantity(
          'workspace-1',
          PlanGatedFeature.WHATSAPP,
        ),
      ).toBe(3);
    });
  });

  describe('grantModuleIfMissing', () => {
    it('inserts a grandfather row when none exists for that module', async () => {
      findOneGrandfather.mockResolvedValue(null);
      saveGrandfather.mockResolvedValue(undefined);

      const service = await buildService();

      await service.grantModuleIfMissing(
        'workspace-1',
        PlanGatedFeature.WORKFLOWS_ADVANCED,
        'had active workflows before the redesign',
      );

      expect(saveGrandfather).toHaveBeenCalledWith('workspace-1', {
        module: PlanGatedFeature.WORKFLOWS_ADVANCED,
        reason: 'had active workflows before the redesign',
      });
    });

    it('is a no-op (idempotent) when a grandfather row already exists', async () => {
      findOneGrandfather.mockResolvedValue({
        module: PlanGatedFeature.WORKFLOWS_ADVANCED,
      });

      const service = await buildService();

      await service.grantModuleIfMissing(
        'workspace-1',
        PlanGatedFeature.WORKFLOWS_ADVANCED,
        'irrelevant, should not be written',
      );

      expect(saveGrandfather).not.toHaveBeenCalled();
    });
  });
});
