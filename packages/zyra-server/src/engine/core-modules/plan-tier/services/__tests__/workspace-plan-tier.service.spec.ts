import { Test } from '@nestjs/testing';

import { NO_BILLING_SUBSCRIPTION } from 'src/engine/core-modules/billing/constants/no-billing-subscription.constant';
import { SubscriptionStatus } from 'src/engine/core-modules/billing/enums/billing-subscription-status.enum';
import { WorkspacePlanGrandfatherEntity } from 'src/engine/core-modules/plan-tier/entities/workspace-plan-grandfather.entity';
import { PlanGatedFeature } from 'src/engine/core-modules/plan-tier/enums/plan-gated-feature.enum';
import { WorkspacePlanTier } from 'src/engine/core-modules/plan-tier/enums/workspace-plan-tier.enum';
import { WorkspacePlanTierService } from 'src/engine/core-modules/plan-tier/services/workspace-plan-tier.service';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { getWorkspaceScopedRepositoryToken } from 'src/engine/zyra-orm/workspace-scoped-repository/get-workspace-scoped-repository-token.util';

describe('WorkspacePlanTierService', () => {
  const findOneGrandfather = jest.fn();
  const getOrRecompute = jest.fn();

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
            WorkspacePlanGrandfatherEntity,
          ),
          useValue: { findOne: findOneGrandfather },
        },
      ],
    }).compile();

    return moduleRef.get(WorkspacePlanTierService);
  };

  beforeEach(() => {
    findOneGrandfather.mockReset();
    getOrRecompute.mockReset();
  });

  it('returns PRO when an active subscription exists', async () => {
    getOrRecompute.mockResolvedValue({
      currentBillingSubscription: { status: SubscriptionStatus.Active },
    });
    findOneGrandfather.mockResolvedValue(null);

    const service = await buildService();

    expect(await service.getWorkspacePlanTier('workspace-1')).toBe(
      WorkspacePlanTier.PRO,
    );
  });

  it('returns PRO when grandfathered, even with no subscription', async () => {
    getOrRecompute.mockResolvedValue({
      currentBillingSubscription: NO_BILLING_SUBSCRIPTION,
    });
    findOneGrandfather.mockResolvedValue({ workspaceId: 'workspace-1' });

    const service = await buildService();

    expect(await service.getWorkspacePlanTier('workspace-1')).toBe(
      WorkspacePlanTier.PRO,
    );
  });

  it('returns BASIC when neither an active subscription nor a grandfather row exists', async () => {
    getOrRecompute.mockResolvedValue({
      currentBillingSubscription: NO_BILLING_SUBSCRIPTION,
    });
    findOneGrandfather.mockResolvedValue(null);

    const service = await buildService();

    expect(await service.getWorkspacePlanTier('workspace-1')).toBe(
      WorkspacePlanTier.BASIC,
    );
  });

  it('returns BASIC when subscription exists but is canceled', async () => {
    getOrRecompute.mockResolvedValue({
      currentBillingSubscription: { status: SubscriptionStatus.Canceled },
    });
    findOneGrandfather.mockResolvedValue(null);

    const service = await buildService();

    expect(await service.getWorkspacePlanTier('workspace-1')).toBe(
      WorkspacePlanTier.BASIC,
    );
  });

  it('hasAccessToFeature is true only for PRO workspaces', async () => {
    getOrRecompute.mockResolvedValue({
      currentBillingSubscription: NO_BILLING_SUBSCRIPTION,
    });
    findOneGrandfather.mockResolvedValue(null);

    const service = await buildService();

    expect(
      await service.hasAccessToFeature(
        'workspace-1',
        PlanGatedFeature.WHATSAPP,
      ),
    ).toBe(false);
  });
});
