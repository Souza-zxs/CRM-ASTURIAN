import {
  type CanActivate,
  type ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';

import { PlanGatedFeature } from 'src/engine/core-modules/plan-tier/enums/plan-gated-feature.enum';
import { WorkspacePlanTierService } from 'src/engine/core-modules/plan-tier/services/workspace-plan-tier.service';
import { TypedReflect } from 'src/utils/typed-reflect';

export const PLAN_GATED_FEATURE_KEY = 'plan-gated-feature-metadata-args';

export function RequirePlanGatedFeature(feature: PlanGatedFeature) {
  return (
    target: object,
    _propertyKey?: string,
    descriptor?: PropertyDescriptor,
  ) => {
    TypedReflect.defineMetadata(
      PLAN_GATED_FEATURE_KEY,
      feature,
      descriptor?.value || target,
    );

    return descriptor;
  };
}

@Injectable()
export class WorkspacePlanTierGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly workspacePlanTierService: WorkspacePlanTierService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const ctx = GqlExecutionContext.create(context);
    const request = ctx.getContext().req;
    const workspaceId = request.workspace?.id;

    if (!workspaceId) {
      return false;
    }

    const feature = this.reflector.get<PlanGatedFeature>(
      PLAN_GATED_FEATURE_KEY,
      context.getHandler(),
    );

    if (!feature) {
      return true;
    }

    const hasAccess = await this.workspacePlanTierService.hasAccessToFeature(
      workspaceId,
      feature,
    );

    if (!hasAccess) {
      throw new ForbiddenException(
        `This feature requires the "${feature}" module to be contracted.`,
      );
    }

    return true;
  }
}
