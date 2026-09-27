import { type ApiKeyRoleService } from 'src/engine/core-modules/api-key/services/api-key-role.service';
import { type SystemWorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { CommonApiContextBuilderService } from 'src/engine/core-modules/record-crud/services/common-api-context-builder.service';
import { type UserRoleService } from 'src/engine/metadata-modules/user-role/user-role.service';
import { type WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { type WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';

const buildService = () => {
  const getRoleIdForUserWorkspace = jest.fn();
  const getRoleIdForApiKeyId = jest.fn();
  const getOrRecompute = jest.fn();

  const service = new CommonApiContextBuilderService(
    {} as WorkspaceManyOrAllFlatEntityMapsCacheService,
    { getOrRecompute } as unknown as WorkspaceCacheService,
    { getRoleIdForUserWorkspace } as unknown as UserRoleService,
    { getRoleIdForApiKeyId } as unknown as ApiKeyRoleService,
  );

  return { service, getRoleIdForUserWorkspace, getRoleIdForApiKeyId, getOrRecompute };
};

describe('CommonApiContextBuilderService.getObjectsPermissions', () => {
  it('returns no role restrictions for a system context, without looking up any role', async () => {
    const { service, getRoleIdForUserWorkspace, getRoleIdForApiKeyId, getOrRecompute } =
      buildService();

    const systemContext: SystemWorkspaceAuthContext = {
      type: 'system',
      workspace: { id: 'workspace-1' } as SystemWorkspaceAuthContext['workspace'],
    };

    const permissions = await service['getObjectsPermissions'](systemContext);

    expect(permissions).toEqual({});
    expect(getRoleIdForUserWorkspace).not.toHaveBeenCalled();
    expect(getRoleIdForApiKeyId).not.toHaveBeenCalled();
    expect(getOrRecompute).not.toHaveBeenCalled();
  });

  it('still rejects an auth context that carries no known authentication mechanism', async () => {
    const { service } = buildService();

    const unknownContext = {
      type: 'unknown',
      workspace: { id: 'workspace-1' },
    } as unknown as SystemWorkspaceAuthContext;

    await expect(
      service['getObjectsPermissions'](unknownContext),
    ).rejects.toThrow('Invalid auth context - no authentication mechanism found');
  });
});
