import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { SyncStandardDashboardCommand } from 'src/database/commands/upgrade-version-command/2-16/2-16-workspace-command-1810000000000-sync-standard-dashboard.command';

const WORKSPACE_ID = '8d342e51-c39b-4392-a143-2ceef0317290';

const buildArgs = (dryRun: boolean): RunOnWorkspaceArgs =>
  ({
    workspaceId: WORKSPACE_ID,
    options: { dryRun },
  }) as unknown as RunOnWorkspaceArgs;

describe('SyncStandardDashboardCommand', () => {
  let synchronize: jest.Mock;
  let command: SyncStandardDashboardCommand;

  beforeEach(() => {
    synchronize = jest.fn().mockResolvedValue(undefined);
    command = new SyncStandardDashboardCommand(
      {} as never,
      { synchronizeZyraStandardApplicationOrThrow: synchronize } as never,
    );
  });

  it('should synchronize the standard application for the workspace', async () => {
    await command.runOnWorkspace(buildArgs(false));

    expect(synchronize).toHaveBeenCalledTimes(1);
    expect(synchronize).toHaveBeenCalledWith({ workspaceId: WORKSPACE_ID });
  });

  it('should skip workspaces outside the target list so no other dashboard is touched', async () => {
    await command.runOnWorkspace({
      workspaceId: '11111111-1111-4111-8111-111111111111',
      options: { dryRun: false },
    } as unknown as RunOnWorkspaceArgs);

    expect(synchronize).not.toHaveBeenCalled();
  });

  it('should not change anything on a dry run', async () => {
    await command.runOnWorkspace(buildArgs(true));

    expect(synchronize).not.toHaveBeenCalled();
  });

  it('should let a synchronization failure surface instead of hiding it', async () => {
    synchronize.mockRejectedValue(new Error('migration failed'));

    await expect(command.runOnWorkspace(buildArgs(false))).rejects.toThrow(
      'migration failed',
    );
  });

  it('should be safe to run twice on the same workspace', async () => {
    await command.runOnWorkspace(buildArgs(false));
    await command.runOnWorkspace(buildArgs(false));

    expect(synchronize).toHaveBeenCalledTimes(2);
    expect(synchronize).toHaveBeenNthCalledWith(2, {
      workspaceId: WORKSPACE_ID,
    });
  });
});
