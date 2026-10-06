import { Injectable } from '@nestjs/common';

import {
  BASE_PLAN_LIMITS,
  MODULE_CATALOG,
  PlanLimitKey,
} from 'src/engine/core-modules/plan-tier/constants/module-catalog.constant';
import { PlanLimitExceededException } from 'src/engine/core-modules/plan-tier/exceptions/plan-limit-exceeded.exception';
import { PlanGatedFeature } from 'src/engine/core-modules/plan-tier/enums/plan-gated-feature.enum';
import { WorkspacePlanTier } from 'src/engine/core-modules/plan-tier/enums/workspace-plan-tier.enum';
import { WorkspacePlanTierService } from 'src/engine/core-modules/plan-tier/services/workspace-plan-tier.service';

// Deliberately does NOT count usage itself — each domain (workflows,
// whatsapp, voice, ...) already owns the repository/query needed to count
// its own records, and importing all of those into one service here would
// make this module depend on every feature module (and risk circular
// imports back the other way, since several of those modules already depend
// on PlanTierModule for the guard). Callers count, this service only
// resolves "what's the limit" and "did you exceed it".
@Injectable()
export class PlanLimitService {
  constructor(
    private readonly workspacePlanTierService: WorkspacePlanTierService,
  ) {}

  // Sum of BASE_PLAN_LIMITS[key] plus, for every module the workspace has
  // contracted (grandfathered or billed), that module's includedLimits[key]
  // multiplied by its contracted quantity. A key absent everywhere resolves
  // to 0, which reads correctly as "not included in anything you have".
  async resolveLimit(workspaceId: string, key: PlanLimitKey): Promise<number> {
    let limit = BASE_PLAN_LIMITS[key] ?? 0;

    for (const feature of Object.values(PlanGatedFeature)) {
      const includedForThisModule = MODULE_CATALOG[feature].includedLimits[key];

      if (includedForThisModule === undefined) {
        continue;
      }

      const quantity = await this.workspacePlanTierService.getModuleQuantity(
        workspaceId,
        feature,
      );

      limit += includedForThisModule * quantity;
    }

    return limit;
  }

  // Throws PlanLimitExceededException when currentUsage (computed by the
  // caller, which owns the counting query) is already at or above the
  // resolved limit, or when the workspace has no active base subscription
  // at all (limit resolves to 0 regardless of modules in that case — no
  // free access, per the 2026-10-03 pricing decision).
  async assertWithinLimit(
    workspaceId: string,
    key: PlanLimitKey,
    currentUsage: number,
  ): Promise<void> {
    const planTier =
      await this.workspacePlanTierService.getWorkspacePlanTier(workspaceId);

    if (planTier !== WorkspacePlanTier.PRO) {
      throw new PlanLimitExceededException(key, currentUsage, 0);
    }

    const limit = await this.resolveLimit(workspaceId, key);

    if (currentUsage >= limit) {
      throw new PlanLimitExceededException(key, currentUsage, limit);
    }
  }
}
