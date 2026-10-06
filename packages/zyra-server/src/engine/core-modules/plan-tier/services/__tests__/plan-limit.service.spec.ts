import { Test } from '@nestjs/testing';

import { PlanGatedFeature } from 'src/engine/core-modules/plan-tier/enums/plan-gated-feature.enum';
import { WorkspacePlanTier } from 'src/engine/core-modules/plan-tier/enums/workspace-plan-tier.enum';
import { PlanLimitExceededException } from 'src/engine/core-modules/plan-tier/exceptions/plan-limit-exceeded.exception';
import { PlanLimitService } from 'src/engine/core-modules/plan-tier/services/plan-limit.service';
import { WorkspacePlanTierService } from 'src/engine/core-modules/plan-tier/services/workspace-plan-tier.service';

describe('PlanLimitService', () => {
  const getWorkspacePlanTier = jest.fn();
  const getModuleQuantity = jest.fn();

  const buildService = async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        PlanLimitService,
        {
          provide: WorkspacePlanTierService,
          useValue: { getWorkspacePlanTier, getModuleQuantity },
        },
      ],
    }).compile();

    return moduleRef.get(PlanLimitService);
  };

  beforeEach(() => {
    getWorkspacePlanTier.mockReset().mockResolvedValue(WorkspacePlanTier.PRO);
    getModuleQuantity.mockReset().mockResolvedValue(0);
  });

  describe('resolveLimit', () => {
    it('returns the base limit when no module contributes to this key', async () => {
      const service = await buildService();

      expect(await service.resolveLimit('workspace-1', 'maxDashboards')).toBe(
        3,
      );
    });

    it('returns 0 for a key nothing (base or any module) defines', async () => {
      const service = await buildService();

      expect(
        await service.resolveLimit('workspace-1', 'apiRateLimitPerMinute'),
      ).toBe(0);
    });

    it('adds a quantifiable module\'s included limit, multiplied by quantity', async () => {
      getModuleQuantity.mockImplementation((_workspaceId, feature) =>
        feature === PlanGatedFeature.WHATSAPP ? Promise.resolve(2) : 0,
      );

      const service = await buildService();

      // base maxWhatsAppNumbers is 0 (not a base-plan limit), module gives 1
      // per unit, quantity 2 contracted.
      expect(
        await service.resolveLimit('workspace-1', 'maxWhatsAppNumbers'),
      ).toBe(2);
    });

    it('combines the base allowance with a contracted module for the same key', async () => {
      getModuleQuantity.mockImplementation((_workspaceId, feature) =>
        feature === PlanGatedFeature.WORKFLOWS_ADVANCED
          ? Promise.resolve(1)
          : 0,
      );

      const service = await buildService();

      // base = 2 (free workflows), WORKFLOWS_ADVANCED module adds 20.
      expect(
        await service.resolveLimit('workspace-1', 'maxWorkflowsActive'),
      ).toBe(22);
    });
  });

  describe('assertWithinLimit', () => {
    it('throws when the workspace has no active base subscription, regardless of usage', async () => {
      getWorkspacePlanTier.mockResolvedValue(WorkspacePlanTier.BASIC);

      const service = await buildService();

      await expect(
        service.assertWithinLimit('workspace-1', 'maxDashboards', 0),
      ).rejects.toThrow(PlanLimitExceededException);
    });

    it('does not throw when usage is below the resolved limit', async () => {
      const service = await buildService();

      await expect(
        service.assertWithinLimit('workspace-1', 'maxDashboards', 2),
      ).resolves.toBeUndefined();
    });

    it('throws when usage has reached the resolved limit', async () => {
      const service = await buildService();

      await expect(
        service.assertWithinLimit('workspace-1', 'maxDashboards', 3),
      ).rejects.toThrow(PlanLimitExceededException);
    });
  });
});
