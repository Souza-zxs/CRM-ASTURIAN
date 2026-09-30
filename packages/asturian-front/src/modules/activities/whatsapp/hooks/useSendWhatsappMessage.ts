import { useApolloClient, useMutation } from '@apollo/client/react';
import { t } from '@lingui/core/macro';
import { useCallback } from 'react';

import { SEND_WHATSAPP_MESSAGE } from '@/activities/whatsapp/graphql/mutations/sendWhatsappMessage';
import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import {
  type SendWhatsappMessageMutation,
  type SendWhatsappMessageMutationVariables,
} from '~/generated-metadata/graphql';

type SendWhatsappMessageParams = {
  connectedAccountId: string;
  to: string;
  body: string;
};

export const useSendWhatsappMessage = () => {
  // Mutation e queries de whatsapp vivem no /metadata; as mensagens (records) no /graphql
  const apolloClient = useApolloClient();
  const apolloCoreClient = useApolloCoreClient();

  const [sendWhatsappMessageMutation, { loading }] = useMutation<
    SendWhatsappMessageMutation,
    SendWhatsappMessageMutationVariables
  >(SEND_WHATSAPP_MESSAGE, { client: apolloClient });

  const { enqueueSuccessSnackBar, enqueueErrorSnackBar } = useSnackBar();

  const sendWhatsappMessage = useCallback(
    async (params: SendWhatsappMessageParams): Promise<boolean> => {
      try {
        const result = await sendWhatsappMessageMutation({
          variables: { input: params },
        });

        if (result.data?.sendWhatsappMessage.success === true) {
          enqueueSuccessSnackBar({ message: t`Message sent` });

          await apolloClient.refetchQueries({
            include: [
              'GetWhatsappThreadIdForPerson',
              'GetWhatsappConversations',
            ],
          });
          await apolloCoreClient.refetchQueries({
            include: ['FindManyMessages'],
          });

          return true;
        }

        enqueueErrorSnackBar({
          message:
            result.data?.sendWhatsappMessage.error ?? t`Failed to send message`,
        });

        return false;
      } catch {
        enqueueErrorSnackBar({ message: t`Failed to send message` });

        return false;
      }
    },
    [
      sendWhatsappMessageMutation,
      enqueueSuccessSnackBar,
      enqueueErrorSnackBar,
      apolloClient,
      apolloCoreClient,
    ],
  );

  return { sendWhatsappMessage, loading };
};
