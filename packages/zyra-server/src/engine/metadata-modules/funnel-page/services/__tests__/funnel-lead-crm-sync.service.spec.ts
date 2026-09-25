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
  const updateRecordService = { execute: jest.fn() };

  const buildService = () =>
    new FunnelLeadCrmSyncService(
      findRecordsService as never,
      createRecordService as never,
      updateRecordService as never,
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

  describe('markLeadAsAttendee', () => {
    const markAttendee = () =>
      buildService().markLeadAsAttendee({
        workspaceId: WORKSPACE_ID,
        email: lead.email,
      });

    it('should move the lead opportunity from NEW to MEETING', async () => {
      findRecordsService.execute
        .mockResolvedValueOnce({
          success: true,
          result: { records: [{ id: 'person-1' }], count: 1 },
        })
        .mockResolvedValueOnce({
          success: true,
          result: { records: [{ id: 'opportunity-1' }], count: 1 },
        });
      updateRecordService.execute.mockResolvedValue({ success: true });

      await markAttendee();

      expect(findRecordsService.execute).toHaveBeenNthCalledWith(
        2,
        expect.objectContaining({
          objectName: 'opportunity',
          filter: {
            pointOfContactId: { eq: 'person-1' },
            stage: { eq: 'NEW' },
          },
        }),
      );
      expect(updateRecordService.execute).toHaveBeenCalledWith(
        expect.objectContaining({
          objectName: 'opportunity',
          objectRecordId: 'opportunity-1',
          objectRecord: { stage: 'MEETING' },
        }),
      );
    });

    it('should leave the CRM untouched when no opportunity is in stage NEW', async () => {
      findRecordsService.execute
        .mockResolvedValueOnce({
          success: true,
          result: { records: [{ id: 'person-1' }], count: 1 },
        })
        .mockResolvedValueOnce({
          success: true,
          result: { records: [], count: 0 },
        });

      await markAttendee();

      expect(updateRecordService.execute).not.toHaveBeenCalled();
    });

    it('should do nothing when the person is not in the CRM', async () => {
      findRecordsService.execute.mockResolvedValue({
        success: true,
        result: { records: [], count: 0 },
      });

      await markAttendee();

      expect(findRecordsService.execute).toHaveBeenCalledTimes(1);
      expect(updateRecordService.execute).not.toHaveBeenCalled();
    });

    it('should not throw when the update fails', async () => {
      findRecordsService.execute
        .mockResolvedValueOnce({
          success: true,
          result: { records: [{ id: 'person-1' }], count: 1 },
        })
        .mockResolvedValueOnce({
          success: true,
          result: { records: [{ id: 'opportunity-1' }], count: 1 },
        });
      updateRecordService.execute.mockResolvedValue({
        success: false,
        message: 'boom',
      });

      await expect(markAttendee()).resolves.toBeUndefined();
    });
  });
});
