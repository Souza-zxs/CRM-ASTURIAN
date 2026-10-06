import { type ExecutionContext, ForbiddenException } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

import { PlanGatedFeature } from 'src/engine/core-modules/plan-tier/enums/plan-gated-feature.enum';
import { type WorkspacePlanTierService } from 'src/engine/core-modules/plan-tier/services/workspace-plan-tier.service';
import { WorkspacePlanTierGuard } from 'src/engine/guards/workspace-plan-tier.guard';

describe('WorkspacePlanTierGuard', () => {
  let guard: WorkspacePlanTierGuard;
  let mockReflector: { get: jest.Mock };
  let mockWorkspacePlanTierService: jest.Mocked<WorkspacePlanTierService>;
  let mockExecutionContext: ExecutionContext;
  let mockGqlContext: any;

  beforeEach(() => {
    mockReflector = { get: jest.fn() };

    mockWorkspacePlanTierService = {
      hasAccessToFeature: jest.fn(),
    } as any;

    mockGqlContext = {
      req: { workspace: { id: 'workspace-id' } },
    };

    mockExecutionContext = {
      getHandler: () => jest.fn(),
    } as unknown as ExecutionContext;

    jest
      .spyOn(GqlExecutionContext, 'create')
      .mockReturnValue({ getContext: () => mockGqlContext } as any);

    guard = new WorkspacePlanTierGuard(
      mockReflector as any,
      mockWorkspacePlanTierService,
    );
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('denies when there is no workspace on the request', async () => {
    mockGqlContext.req.workspace = undefined;

    const result = await guard.canActivate(mockExecutionContext);

    expect(result).toBe(false);
  });

  it('allows when the handler has no gated feature metadata', async () => {
    mockReflector.get.mockReturnValue(undefined);

    const result = await guard.canActivate(mockExecutionContext);

    expect(result).toBe(true);
    expect(
      mockWorkspacePlanTierService.hasAccessToFeature,
    ).not.toHaveBeenCalled();
  });

  it('allows when the workspace has access to the gated feature', async () => {
    mockReflector.get.mockReturnValue(PlanGatedFeature.WHATSAPP);
    mockWorkspacePlanTierService.hasAccessToFeature.mockResolvedValue(true);

    const result = await guard.canActivate(mockExecutionContext);

    expect(result).toBe(true);
    expect(
      mockWorkspacePlanTierService.hasAccessToFeature,
    ).toHaveBeenCalledWith('workspace-id', PlanGatedFeature.WHATSAPP);
  });

  it('throws ForbiddenException when the workspace lacks access to the gated feature', async () => {
    mockReflector.get.mockReturnValue(PlanGatedFeature.WHATSAPP);
    mockWorkspacePlanTierService.hasAccessToFeature.mockResolvedValue(false);

    await expect(guard.canActivate(mockExecutionContext)).rejects.toThrow(
      ForbiddenException,
    );
  });
});
