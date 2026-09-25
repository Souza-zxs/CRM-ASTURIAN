import { type CreateFunnelLeadInput } from 'src/engine/metadata-modules/funnel-page/dtos/create-funnel-lead.input';
import { FunnelLeadCrmSyncService } from 'src/engine/metadata-modules/funnel-page/services/funnel-lead-crm-sync.service';

const WORKSPACE_ID = 'f7a7d81f-b6b3-42f3-8bba-51e74e90af90';

const lead: CreateFunnelLeadInput = {
  funnelPageId: '11111111-1111-4111-8111-111111111111',
  name: 'Maria da Silva',
  email: 'maria@example.com',
  whatsapp: '(83) 99999-9999',
};

describe('FunnelLeadCrmSyncService', () => {
  const findRecordsService = { execute: jest.fn() };
  const createRecordService = { execute: jest.fn() };

  const buildService = () =>
    new FunnelLeadCrmSyncService(
      findRecordsService as never,
      createRecordService as never,
    );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create a person and an opportunity in stage NEW for a new email', async () => {
    findRecordsService.execute.mockResolvedValue({
      success: true,
      result: { records: [], count: 0 },
    });
    createRecordService.execute
      .mockResolvedValueOnce({ success: true, result: { id: 'person-1' } })
      .mockResolvedValueOnce({
        success: true,
        result: { id: 'opportunity-1' },
      });

    await buildService().syncLeadToCrm({ workspaceId: WORKSPACE_ID, lead });

    expect(createRecordService.execute).toHaveBeenCalledTimes(2);
    expect(createRecordService.execute).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        objectName: 'person',
        objectRecord: expect.objectContaining({
          name: { firstName: 'Maria', lastName: 'da Silva' },
          emails: { primaryEmail: 'maria@example.com' },
        }),
      }),
    );
    expect(createRecordService.execute).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        objectName: 'opportunity',
        objectRecord: expect.objectContaining({
          stage: 'NEW',
          pointOfContactId: 'person-1',
        }),
      }),
    );
  });

  it('should reuse an existing person instead of creating a duplicate', async () => {
    findRecordsService.execute.mockResolvedValue({
      success: true,
      result: { records: [{ id: 'existing-person' }], count: 1 },
    });
    createRecordService.execute.mockResolvedValue({
      success: true,
      result: { id: 'opportunity-1' },
    });

    await buildService().syncLeadToCrm({ workspaceId: WORKSPACE_ID, lead });

    expect(createRecordService.execute).toHaveBeenCalledTimes(1);
    expect(createRecordService.execute).toHaveBeenCalledWith(
      expect.objectContaining({
        objectName: 'opportunity',
        objectRecord: expect.objectContaining({
          pointOfContactId: 'existing-person',
        }),
      }),
    );
  });

  it('should not throw when the CRM write fails', async () => {
    findRecordsService.execute.mockResolvedValue({
      success: true,
      result: { records: [], count: 0 },
    });
    createRecordService.execute.mockResolvedValue({
      success: false,
      message: 'boom',
    });

    await expect(
      buildService().syncLeadToCrm({ workspaceId: WORKSPACE_ID, lead }),
    ).resolves.toBeUndefined();
  });
});
