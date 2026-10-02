import { UseFilters, UseGuards, UsePipes } from '@nestjs/common';
import { Args, Mutation } from '@nestjs/graphql';

import graphqlTypeJson from 'graphql-type-json';
import { PermissionFlagType } from 'zyra-shared/constants';

import { CoreResolver } from 'src/engine/api/graphql/graphql-config/decorators/core-resolver.decorator';
import { PreventNestToAutoLogGraphqlErrorsFilter } from 'src/engine/core-modules/graphql/filters/prevent-nest-to-auto-log-graphql-errors.filter';
import { ResolverValidationPipe } from 'src/engine/core-modules/graphql/pipes/resolver-validation.pipe';
import { ComputeStepOutputSchemaInput } from 'src/engine/core-modules/workflow/dtos/compute-step-output-schema.input';
import { WorkflowTriggerGraphqlApiExceptionFilter } from 'src/engine/core-modules/workflow/filters/workflow-trigger-graphql-api-exception.filter';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { SettingsPermissionGuard } from 'src/engine/guards/settings-permission.guard';
import { UserAuthGuard } from 'src/engine/guards/user-auth.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import {
  RequirePlanGatedFeature,
  WorkspacePlanTierGuard,
} from 'src/engine/guards/workspace-plan-tier.guard';
import { PlanGatedFeature } from 'src/engine/core-modules/plan-tier/enums/plan-gated-feature.enum';
import { PermissionsGraphqlApiExceptionFilter } from 'src/engine/metadata-modules/permissions/utils/permissions-graphql-api-exception.filter';
import { type OutputSchema } from 'src/modules/workflow/workflow-builder/workflow-schema/types/output-schema.type';
import { WorkflowSchemaWorkspaceService } from 'src/modules/workflow/workflow-builder/workflow-schema/workflow-schema.workspace-service';

@CoreResolver()
@UseGuards(
  WorkspaceAuthGuard,
  UserAuthGuard,
  WorkspacePlanTierGuard,
  SettingsPermissionGuard(PermissionFlagType.WORKFLOWS),
)
@UsePipes(ResolverValidationPipe)
@UseFilters(
  WorkflowTriggerGraphqlApiExceptionFilter,
  PermissionsGraphqlApiExceptionFilter,
  PreventNestToAutoLogGraphqlErrorsFilter,
)
export class WorkflowBuilderResolver {
  constructor(
    private readonly workflowSchemaWorkspaceService: WorkflowSchemaWorkspaceService,
  ) {}

  @Mutation(() => graphqlTypeJson)
  @RequirePlanGatedFeature(PlanGatedFeature.WORKFLOWS)
  async computeStepOutputSchema(
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
    @Args('input') { step, workflowVersionId }: ComputeStepOutputSchemaInput,
  ): Promise<OutputSchema> {
    return this.workflowSchemaWorkspaceService.computeStepOutputSchema({
      step,
      workspaceId,
      workflowVersionId,
    });
  }
}
