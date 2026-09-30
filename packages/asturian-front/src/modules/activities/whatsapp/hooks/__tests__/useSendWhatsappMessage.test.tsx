import { renderHook } from '@testing-library/react';

import { SEND_WHATSAPP_MESSAGE } from '@/activities/whatsapp/graphql/mutations/sendWhatsappMessage';
import { useSendWhatsappMessage } from '@/activities/whatsapp/hooks/useSendWhatsappMessage';
import { getJestMetadataAndApolloMocksWrapper } from '~/testing/jest/getJestMetadataAndApolloMocksWrapper';

const params = {
  connectedAccountId: 'connected-account-1',
  to: '5511999999999',
  body: 'Oi!',
};

const buildWrapper = (sendWhatsappMessage: {
  success: boolean;
  error: string | null;
}) =>
  getJestMetadataAndApolloMocksWrapper({
    apolloMocks: [
      {
        request: {
          query: SEND_WHATSAPP_MESSAGE,
          variables: { input: params },
        },
        result: { data: { sendWhatsappMessage } },
      },
    ],
  });

describe('useSendWhatsappMessage', () => {
  it('should return true when the message is sent', async () => {
    const { result } = renderHook(() => useSendWhatsappMessage(), {
      wrapper: buildWrapper({ success: true, error: null }),
    });

    const wasSent = await result.current.sendWhatsappMessage(params);

    expect(wasSent).toBe(true);
  });

  it('should return false when the backend reports an error', async () => {
    const { result } = renderHook(() => useSendWhatsappMessage(), {
      wrapper: buildWrapper({
        success: false,
        error: 'Fora da janela de 24h',
      }),
    });

    const wasSent = await result.current.sendWhatsappMessage(params);

    expect(wasSent).toBe(false);
  });
});
