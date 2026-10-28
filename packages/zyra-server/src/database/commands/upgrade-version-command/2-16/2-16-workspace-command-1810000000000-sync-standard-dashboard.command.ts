import { Command } from 'nest-commander';

import { ActiveOrSuspendedWorkspaceCommandRunner } from 'src/database/commands/command-runners/active-or-suspended-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { ZyraStandardApplicationService } from 'src/engine/workspace-manager/zyra-standard-application/services/zyra-standard-application.service';

// Workspaces created before the "Início" dashboard shipped still carry the
// sample "My First Dashboard" widgets. Re-running the standard application
// sync reconciles that dashboard with the current standard config (the new
// KPIs, the pipeline chart and the upcoming tasks). The sync is idempotent:
// on a workspace that is already up to date it changes nothing.
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
