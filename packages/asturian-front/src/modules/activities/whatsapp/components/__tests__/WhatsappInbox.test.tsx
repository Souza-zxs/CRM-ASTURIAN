import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { WhatsappInbox } from '@/activities/whatsapp/components/WhatsappInbox';
import { I18nProvider } from '@lingui/react';
import { i18n } from '@lingui/core';
import { getJestMetadataAndApolloMocksWrapper } from '~/testing/jest/getJestMetadataAndApolloMocksWrapper';

jest.mock('@/activities/whatsapp/hooks/useWhatsappConversations', () => ({
  useWhatsappConversations: () => ({
    conversations: [
      {
        messageThreadId: 'thread-1',
        contactPhoneNumber: '5511999999999',
        contactDisplayName: 'Maria',
        personId: null,
        lastMessageBody: 'Oi, tudo bem?',
        lastMessageReceivedAt: '2026-09-28T10:00:00Z',
      },
    ],
    loading: false,
  }),
}));

jest.mock('@/activities/whatsapp/hooks/useWhatsappThreadMessages', () => ({
  useWhatsappThreadMessages: (messageThreadId: string | null) => ({
    messages:
      messageThreadId === 'thread-1'
        ? [
            {
              id: 'message-1',
              text: 'Historico da Maria',
              receivedAt: '2026-09-28T10:00:00Z',
              createdAt: '2026-09-28T10:00:00Z',
              messageParticipants: [],
            },
          ]
        : [],
    loading: false,
  }),
}));

jest.mock('@/activities/whatsapp/hooks/useSendWhatsappMessage', () => ({
  useSendWhatsappMessage: () => ({
    sendWhatsappMessage: jest.fn(),
    loading: false,
  }),
}));

jest.mock('@/settings/accounts/hooks/useMyWhatsappChannels', () => ({
  useMyWhatsappChannels: () => ({ channels: [], loading: false }),
}));

const Wrapper = getJestMetadataAndApolloMocksWrapper({ apolloMocks: [] });

describe('WhatsappInbox', () => {
  it('should list conversations and open the history when one is clicked', async () => {
    const user = userEvent.setup();

    render(
      <I18nProvider i18n={i18n}>
        <WhatsappInbox />
      </I18nProvider>,
      { wrapper: Wrapper },
    );

    expect(screen.queryByText('Historico da Maria')).not.toBeInTheDocument();

    await user.click(await screen.findByText('Maria'));

    expect(await screen.findByText('Historico da Maria')).toBeVisible();
  });
});
