import { WhatsappTemplateStatus } from 'zyra-shared/types';
import { WorkflowActionType } from 'zyra-shared/workflow';

import { SendWhatsappTemplateWorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/send-whatsapp-template/send-whatsapp-template.workflow-action';

const WORKSPACE_ID = 'f7a7d81f-b6b3-42f3-8bba-51e74e90af90';

const buildStep = (input: Record<string, unknown>) => ({
  id: 'step-1',
  name: 'Send WhatsApp Template',
  type: WorkflowActionType.SEND_WHATSAPP_TEMPLATE,
  valid: true,
  settings: {
    outputSchema: {},
    errorHandlingOptions: {
      retryOnFailure: { value: false },
      continueOnFailure: { value: false },
    },
    input,
  },
});

describe('SendWhatsappTemplateWorkflowAction', () => {
  const whatsappTemplateRepository = { findOne: jest.fn() };
  const whatsappChannelRepository = { findOne: jest.fn() };
  const connectedAccountRepository = { findOne: jest.fn() };
  const tokenEncryptionService = { decrypt: jest.fn() };
  const whatsappGraphApiService = { sendTemplateMessage: jest.fn() };

  const execute = (input: Record<string, unknown>, context = {}) =>
    new SendWhatsappTemplateWorkflowAction(
      whatsappTemplateRepository as never,
      whatsappChannelRepository as never,
      connectedAccountRepository as never,
      tokenEncryptionService as never,
      whatsappGraphApiService as never,
    ).execute({
      currentStepId: 'step-1',
      steps: [buildStep(input)] as never,
      context,
      runInfo: { workspaceId: WORKSPACE_ID, workflowRunId: 'run-1' } as never,
    });

  beforeEach(() => {
    jest.clearAllMocks();
    whatsappTemplateRepository.findOne.mockResolvedValue({
      id: 'template-1',
      name: 'lembrete_workshop',
      language: 'pt_BR',
      status: WhatsappTemplateStatus.APPROVED,
      whatsappChannelId: 'channel-1',
    });
    whatsappChannelRepository.findOne.mockResolvedValue({
      id: 'channel-1',
      phoneNumberId: 'phone-number-id',
      connectedAccountId: 'account-1',
    });
    connectedAccountRepository.findOne.mockResolvedValue({
      id: 'account-1',
      accessToken: 'ciphertext',
    });
    tokenEncryptionService.decrypt.mockReturnValue('plain-token');
    whatsappGraphApiService.sendTemplateMessage.mockResolvedValue({
      messageExternalId: 'wamid.1',
    });
  });

  it('should send the approved template to the normalized recipient', async () => {
    const output = await execute(
      {
        whatsappTemplateId: 'template-1',
        to: '{{trigger.phone}}',
        bodyParameters: ['{{trigger.name}}'],
      },
      { trigger: { phone: '(83) 99999-9999', name: 'Maria' } },
    );

    expect(output).toEqual({ result: { messageExternalId: 'wamid.1' } });
    expect(whatsappGraphApiService.sendTemplateMessage).toHaveBeenCalledWith(
      'phone-number-id',
      'plain-token',
      '5583999999999',
      'lembrete_workshop',
      'pt_BR',
      ['Maria'],
    );
  });

  it('should look the template up scoped to the run workspace', async () => {
    await execute({ whatsappTemplateId: 'template-1', to: '83999999999' });

    expect(whatsappTemplateRepository.findOne).toHaveBeenCalledWith({
      where: { id: 'template-1', workspaceId: WORKSPACE_ID },
    });
  });

  it('should throw when the template is not approved yet', async () => {
    whatsappTemplateRepository.findOne.mockResolvedValue({
      id: 'template-1',
      name: 'lembrete_workshop',
      language: 'pt_BR',
      status: WhatsappTemplateStatus.PENDING,
      whatsappChannelId: 'channel-1',
    });

    await expect(
      execute({ whatsappTemplateId: 'template-1', to: '83999999999' }),
    ).rejects.toThrow('not approved yet');
    expect(whatsappGraphApiService.sendTemplateMessage).not.toHaveBeenCalled();
  });

  it('should throw when the template does not exist in the workspace', async () => {
    whatsappTemplateRepository.findOne.mockResolvedValue(null);

    await expect(
      execute({ whatsappTemplateId: 'template-1', to: '83999999999' }),
    ).rejects.toThrow('WhatsApp template not found');
  });

  it('should throw when the recipient has no digits', async () => {
    await expect(
      execute({ whatsappTemplateId: 'template-1', to: 'sem numero' }),
    ).rejects.toThrow('recipient phone number is required');
  });

  it('should return the Graph API failure as an error instead of throwing', async () => {
    whatsappGraphApiService.sendTemplateMessage.mockRejectedValue(
      new Error('Meta rejected the message'),
    );

    const output = await execute({
      whatsappTemplateId: 'template-1',
      to: '83999999999',
    });

    expect(output).toEqual({ error: 'Meta rejected the message' });
  });
});
