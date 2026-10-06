import { CommonCreateManyQueryRunnerService } from 'src/engine/api/common/common-query-runners/common-create-many-query-runner/common-create-many-query-runner.service';
import { PlanLimitExceededException } from 'src/engine/core-modules/plan-tier/exceptions/plan-limit-exceeded.exception';

// Isolated unit test: builds the service directly (not via a NestJS
// TestingModule) because CommonBaseQueryRunnerService property-injects a
// large, unrelated dependency surface (permissions, query hooks, metrics,
// throttling...) that this test has no business mocking. Only the
// maxContacts/maxCompanies gate added to run() is under test here — the
// rest of run()'s behavior (insert/upsert/fetch/nested relations) is
// stubbed out via spies so this stays a focused test, not a rebuild of the
// whole query-runner stack.
describe('CommonCreateManyQueryRunnerService — plan limit gate', () => {
  const buildService = ({
    nameSingular,
    currentCount,
    assertWithinLimit,
  }: {
    nameSingular: string;
    currentCount: number;
    assertWithinLimit: jest.Mock;
  }) => {
    const repository = {
      count: jest.fn().mockResolvedValue(currentCount),
    };

    const service = new CommonCreateManyQueryRunnerService({} as any);

    // planLimitService is @Inject()-ed on the base class, which Nest's DI
    // container sets as a property after construction — since this test
    // builds the instance directly with `new`, that property injection
    // never runs, so it's assigned by hand here instead.
    (service as any).planLimitService = { assertWithinLimit };

    jest
      .spyOn(service as any, 'insertOrUpsertRecords')
      .mockResolvedValue({ generatedMaps: [] });
    jest.spyOn(service as any, 'fetchUpsertedRecords').mockResolvedValue([]);
    jest
      .spyOn(service as any, 'processNestedRelationsIfNeeded')
      .mockResolvedValue(undefined);

    const queryRunnerContext = {
      repository,
      authContext: { workspace: { id: 'workspace-1' } },
      rolePermissionConfig: undefined,
      flatObjectMetadata: { nameSingular },
      flatObjectMetadataMaps: {},
      flatFieldMetadataMaps: {},
      workspaceDataSource: {},
    };

    return { service, repository, queryRunnerContext };
  };

  it('never checks the limit for an object other than person/company', async () => {
    const assertWithinLimit = jest.fn();
    const { service, repository, queryRunnerContext } = buildService({
      nameSingular: 'opportunity',
      currentCount: 999,
      assertWithinLimit,
    });

    await service.run(
      { data: [{ name: 'Deal' }], selectedFieldsResult: {} } as any,
      queryRunnerContext as any,
    );

    expect(repository.count).not.toHaveBeenCalled();
    expect(assertWithinLimit).not.toHaveBeenCalled();
  });

  it('checks maxContacts for person and lets a within-limit create through', async () => {
    const assertWithinLimit = jest.fn().mockResolvedValue(undefined);
    const { service, queryRunnerContext } = buildService({
      nameSingular: 'person',
      currentCount: 5,
      assertWithinLimit,
    });

    await service.run(
      { data: [{ name: 'Jane' }], selectedFieldsResult: {} } as any,
      queryRunnerContext as any,
    );

    expect(assertWithinLimit).toHaveBeenCalledWith(
      'workspace-1',
      'maxContacts',
      5,
    );
  });

  it('checks maxCompanies for company and accounts for the full batch size', async () => {
    const assertWithinLimit = jest.fn().mockResolvedValue(undefined);
    const { service, queryRunnerContext } = buildService({
      nameSingular: 'company',
      currentCount: 10,
      assertWithinLimit,
    });

    await service.run(
      {
        data: [{ name: 'Acme' }, { name: 'Globex' }, { name: 'Initech' }],
        selectedFieldsResult: {},
      } as any,
      queryRunnerContext as any,
    );

    // currentCount (10) + batch size (3) - 1 = 12: the usage level the
    // batch would reach, checked against the resolved limit.
    expect(assertWithinLimit).toHaveBeenCalledWith(
      'workspace-1',
      'maxCompanies',
      12,
    );
  });

  it('propagates PlanLimitExceededException and never inserts', async () => {
    const assertWithinLimit = jest
      .fn()
      .mockRejectedValue(new PlanLimitExceededException('maxContacts', 5, 5));
    const { service, queryRunnerContext } = buildService({
      nameSingular: 'person',
      currentCount: 5,
      assertWithinLimit,
    });
    const insertSpy = jest.spyOn(service as any, 'insertOrUpsertRecords');

    await expect(
      service.run(
        { data: [{ name: 'Jane' }], selectedFieldsResult: {} } as any,
        queryRunnerContext as any,
      ),
    ).rejects.toThrow(PlanLimitExceededException);

    expect(insertSpy).not.toHaveBeenCalled();
  });
});
