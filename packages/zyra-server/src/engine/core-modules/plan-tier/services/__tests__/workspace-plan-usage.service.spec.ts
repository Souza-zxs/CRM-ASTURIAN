import { WorkspacePlanUsageService } from 'src/engine/core-modules/plan-tier/services/workspace-plan-usage.service';

// Direct instantiation (not a NestJS TestingModule) — this service has one
// repository per domain that owns a plan limit by design (see its own
// docstring), so a TestingModule would mean nine near-identical
// getRepositoryToken mocks for no extra coverage. Each count/sum call is
// stubbed individually; this test verifies the aggregation and DTO mapping,
// not each domain's own counting logic (those already have their own
// coverage at the enforcement call sites).
describe('WorkspacePlanUsageService', () => {
  const buildService = () => {
    const resolveLimit = jest.fn().mockResolvedValue(100);
    const planLimitService = { resolveLimit };

    const applicationService = {
      findWorkspaceZyraStandardAndCustomApplicationOrThrow: jest
        .fn()
        .mockResolvedValue({ zyraStandardFlatApplication: { id: 'std-app' } }),
    };

    const personRepository = { count: jest.fn().mockResolvedValue(10) };
    const companyRepository = { count: jest.fn().mockResolvedValue(3) };
    const workflowVersionRepository = {
      find: jest.fn().mockResolvedValue([
        { workflowId: 'wf-1' },
        { workflowId: 'wf-1' },
        { workflowId: 'wf-2' },
      ]),
    };
    const workflowRunRepository = { count: jest.fn().mockResolvedValue(42) };

    const globalWorkspaceOrmManager = {
      getRepository: jest.fn((_workspaceId: string, nameSingular: string) => {
        if (nameSingular === 'person') return personRepository;
        if (nameSingular === 'company') return companyRepository;
        if (nameSingular === 'workflowVersion') return workflowVersionRepository;
        if (nameSingular === 'workflowRun') return workflowRunRepository;
        throw new Error(`Unexpected object: ${nameSingular}`);
      }),
    };

    const userWorkspaceRepository = { count: jest.fn().mockResolvedValue(4) };
    const whatsappChannelRepository = { count: jest.fn().mockResolvedValue(1) };
    const whatsappAgentRepository = { count: jest.fn().mockResolvedValue(1) };
    const whatsappAgentMessageRepository = {
      count: jest.fn().mockResolvedValue(250),
    };
    const voiceAgentRepository = { count: jest.fn().mockResolvedValue(0) };
    const voiceCallRepository = {
      createQueryBuilder: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getRawOne: jest.fn().mockResolvedValue({ sum: '1800' }),
      }),
    };
    const objectMetadataRepository = { count: jest.fn().mockResolvedValue(2) };
    const fieldMetadataRepository = { count: jest.fn().mockResolvedValue(7) };
    const pageLayoutRepository = { count: jest.fn().mockResolvedValue(1) };

    const service = new WorkspacePlanUsageService(
      planLimitService as any,
      applicationService as any,
      globalWorkspaceOrmManager as any,
      userWorkspaceRepository as any,
      whatsappChannelRepository as any,
      whatsappAgentRepository as any,
      whatsappAgentMessageRepository as any,
      voiceAgentRepository as any,
      voiceCallRepository as any,
      objectMetadataRepository as any,
      fieldMetadataRepository as any,
      pageLayoutRepository as any,
    );

    return { service, resolveLimit };
  };

  it('returns one usage entry per limit key, with used + limit', async () => {
    const { service } = buildService();

    const snapshot = await service.getUsageSnapshot('workspace-1');

    expect(snapshot).toHaveLength(13); // every PlanLimitKey except apiRateLimitPerMinute
    expect(snapshot.every((entry) => entry.limit === 100)).toBe(true);
  });

  it('counts contacts/companies as plain record counts', async () => {
    const { service } = buildService();

    const snapshot = await service.getUsageSnapshot('workspace-1');

    expect(
      snapshot.find((entry) => entry.key === 'maxContacts')?.used,
    ).toBe(10);
    expect(
      snapshot.find((entry) => entry.key === 'maxCompanies')?.used,
    ).toBe(3);
  });

  it('counts distinct workflows with an active version, not total versions', async () => {
    const { service } = buildService();

    const snapshot = await service.getUsageSnapshot('workspace-1');

    // 3 active versions across only 2 distinct workflows (wf-1 has two).
    expect(
      snapshot.find((entry) => entry.key === 'maxWorkflowsActive')?.used,
    ).toBe(2);
  });

  it('converts summed voice call duration from seconds to minutes', async () => {
    const { service } = buildService();

    const snapshot = await service.getUsageSnapshot('workspace-1');

    expect(
      snapshot.find((entry) => entry.key === 'maxVoiceMinutesMonthly')?.used,
    ).toBe(30);
  });
});
