import { Command } from 'nest-commander';
import { STANDARD_OBJECTS } from 'zyra-shared/metadata';
import { isDefined } from 'zyra-shared/utils';

import { ActiveOrSuspendedWorkspaceCommandRunner } from 'src/database/commands/command-runners/active-or-suspended-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { PlanGatedFeature } from 'src/engine/core-modules/plan-tier/enums/plan-gated-feature.enum';
import { WorkspacePlanTierService } from 'src/engine/core-modules/plan-tier/services/workspace-plan-tier.service';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { GlobalWorkspaceOrmManager } from 'src/engine/zyra-orm/global-workspace-datasource/global-workspace-orm.manager';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import {
  WorkflowVersionStatus,
  type WorkflowVersionWorkspaceEntity,
} from 'src/modules/workflow/common/standard-objects/workflow-version.workspace-entity';

// The general legacy-PRO backfill (2-16-instance-command-slow-1803300000000)
// only grants WORKFLOWS_ADVANCED to workspaces that were already PRO or
// grandfathered — it can't see inside a BASIC workspace's own schema, so a
// BASIC workspace that genuinely had workflows running before this gating
// existed would otherwise suddenly lose the ability to activate another one
// (base plan only includes 2, see module-catalog.constant.ts). This command
// closes that gap with a real usage signal instead of a blanket grant: any
// workspace with at least one ACTIVE workflow version gets
// WORKFLOWS_ADVANCED grandfathered, regardless of its current plan tier.
@RegisteredWorkspaceCommand('2.16.0', 1803500000000)
@Command({
  name: 'upgrade:2-16:grandfather-workflows-advanced-by-usage',
  description:
    'Grant the WORKFLOWS_ADVANCED module to any workspace with at least one already-active workflow, preserving pre-existing usage through the à-la-carte module redesign.',
})
export class GrandfatherWorkflowsAdvancedByUsageCommand extends ActiveOrSuspendedWorkspaceCommandRunner {
  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly workspacePlanTierService: WorkspacePlanTierService,
  ) {
    super(workspaceIteratorService);
  }

  override async runOnWorkspace({
    workspaceId,
    options,
  }: RunOnWorkspaceArgs): Promise<void> {
    const isDryRun = options.dryRun ?? false;

    const { flatObjectMetadataMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatObjectMetadataMaps',
      ]);

    const workflowVersionObject =
      findFlatEntityByUniversalIdentifier<FlatObjectMetadata>({
        flatEntityMaps: flatObjectMetadataMaps,
        universalIdentifier: STANDARD_OBJECTS.workflowVersion.universalIdentifier,
      });

    if (!isDefined(workflowVersionObject)) {
      this.logger.log(
        `workflowVersion object not found for workspace ${workspaceId}, skipping`,
      );

      return;
    }

    const workflowVersionRepository =
      await this.globalWorkspaceOrmManager.getRepository<WorkflowVersionWorkspaceEntity>(
        workspaceId,
        'workflowVersion',
        { shouldBypassPermissionChecks: true },
      );

    const activeVersionCount = await workflowVersionRepository.count({
      where: { status: WorkflowVersionStatus.ACTIVE },
    });

    if (activeVersionCount === 0) {
      this.logger.log(
        `No active workflows for workspace ${workspaceId}, skipping`,
      );

      return;
    }

    if (isDryRun) {
      this.logger.log(
        `[dry run] Would grandfather WORKFLOWS_ADVANCED for workspace ${workspaceId} (${activeVersionCount} active workflow(s))`,
      );

      return;
    }

    await this.workspacePlanTierService.grantModuleIfMissing(
      workspaceId,
      PlanGatedFeature.WORKFLOWS_ADVANCED,
      `had ${activeVersionCount} active workflow(s) before the 2026-10-03 à-la-carte module redesign`,
    );

    this.logger.log(
      `Grandfathered WORKFLOWS_ADVANCED for workspace ${workspaceId} (${activeVersionCount} active workflow(s))`,
    );
  }
}
