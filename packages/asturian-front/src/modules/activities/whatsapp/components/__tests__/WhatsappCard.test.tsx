import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { WhatsappCard } from '@/activities/whatsapp/components/WhatsappCard';
import { I18nProvider } from '@lingui/react';
import { i18n } from '@lingui/core';
import { getJestMetadataAndApolloMocksWrapper } from '~/testing/jest/getJestMetadataAndApolloMocksWrapper';

const mockSendWhatsappMessage = jest.fn().mockResolvedValue(true);

jest.mock('@/ui/layout/contexts/useTargetRecord', () => ({
  useTargetRecord: () => ({
    id: 'person-1',
    targetObjectNameSingular: 'person',
  }),
}));

jest.mock('@/activities/whatsapp/hooks/useWhatsappThreadForPerson', () => ({
  useWhatsappThreadForPerson: () => ({
    messageThreadId: 'thread-1',
    messages: [
      {
        id: 'message-1',
        text: 'Oi, tudo bem?',
        receivedAt: '2026-09-28T10:00:00Z',
        createdAt: '2026-09-28T10:00:00Z',
        messageParticipants: [
          { id: 'participant-1', role: 'FROM', handle: '5511999999999' },
          { id: 'participant-2', role: 'TO', handle: '5511888888888' },
        ],
      },
      {
        id: 'message-2',
        text: 'Tudo certo por aqui',
        receivedAt: '2026-09-28T10:01:00Z',
        createdAt: '2026-09-28T10:01:00Z',
        messageParticipants: [
          { id: 'participant-3', role: 'FROM', handle: '+55 11 88888-8888' },
          { id: 'participant-4', role: 'TO', handle: '5511999999999' },
        ],
      },
    ],
    loading: false,
  }),
}));

jest.mock('@/activities/whatsapp/hooks/useSendWhatsappMessage', () => ({
  useSendWhatsappMessage: () => ({
    sendWhatsappMessage: mockSendWhatsappMessage,
    loading: false,
  }),
}));

jest.mock('@/settings/accounts/hooks/useMyWhatsappChannels', () => ({
  useMyWhatsappChannels: () => ({
    channels: [
      {
        id: 'channel-1',
        connectedAccountId: 'connected-account-1',
        displayPhoneNumber: '+55 11 88888-8888',
      },
    ],
    loading: false,
  }),
}));

const Wrapper = getJestMetadataAndApolloMocksWrapper({ apolloMocks: [] });

describe('WhatsappCard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should show the conversation and send a reply to the contact when the user submits the reply box', async () => {
    const user = userEvent.setup();

    render(
      <I18nProvider i18n={i18n}>
        <WhatsappCard />
      </I18nProvider>,
      { wrapper: Wrapper },
    );

    expect(await screen.findByText('Oi, tudo bem?')).toBeVisible();

    await user.type(screen.getByRole('textbox'), 'Tudo sim!');
    await user.click(screen.getByRole('button', { name: /send/i }));

    expect(mockSendWhatsappMessage).toHaveBeenCalledWith({
      connectedAccountId: 'connected-account-1',
      to: '5511999999999',
      body: 'Tudo sim!',
    });
  });
});
