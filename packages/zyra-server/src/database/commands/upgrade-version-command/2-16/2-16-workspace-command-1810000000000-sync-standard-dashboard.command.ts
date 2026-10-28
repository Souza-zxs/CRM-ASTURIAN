import { Command } from 'nest-commander';

import { ActiveOrSuspendedWorkspaceCommandRunner } from 'src/database/commands/command-runners/active-or-suspended-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { ZyraStandardApplicationService } from 'src/engine/workspace-manager/zyra-standard-application/services/zyra-standard-application.service';

// The standard application sync deletes standard widgets that are no longer
// in the config (inferDeletionFromMissingEntities), so this command must not
// reach workspaces whose owners may have edited the sample dashboard. It is
// limited to the owner's own workspace ("Horizon"), whose default dashboard
// was still the unedited sample when this shipped. Workspaces created from
// now on get the "Início" dashboard at activation and need nothing here.
export const SYNC_STANDARD_DASHBOARD_TARGET_WORKSPACE_IDS: ReadonlySet<string> =
  new Set(['8d342e51-c39b-4392-a143-2ceef0317290']);

@RegisteredWorkspaceCommand('2.16.0', 1810000000000)
@Command({
  name: 'upgrade:2-16:sync-standard-dashboard',
  description:
    'Synchronize the zyra-standard application so the default dashboard becomes "Início" with the real-operation widgets',
})
export class SyncStandardDashboardCommand extends ActiveOrSuspendedWorkspaceCommandRunner {
  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
    private readonly zyraStandardApplicationService: ZyraStandardApplicationService,
  ) {
    super(workspaceIteratorService);
  }

  override async runOnWorkspace({
    workspaceId,
    options,
  }: RunOnWorkspaceArgs): Promise<void> {
    if (!SYNC_STANDARD_DASHBOARD_TARGET_WORKSPACE_IDS.has(workspaceId)) {
      this.logger.log(
        `Workspace ${workspaceId} is not a target of the dashboard sync, skipping`,
      );

      return;
    }

    if (options.dryRun ?? false) {
      this.logger.log(
        `[DRY RUN] Would synchronize the standard dashboard for workspace ${workspaceId}`,
      );

      return;
    }

    await this.zyraStandardApplicationService.synchronizeZyraStandardApplicationOrThrow(
      { workspaceId },
    );

    this.logger.log(
      `Synchronized the standard dashboard for workspace ${workspaceId}`,
    );
  }
}
