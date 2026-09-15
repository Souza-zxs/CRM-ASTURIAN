import { type WhatsappTemplate } from '@/accounts/types/WhatsappTemplate';
import { REFRESH_WHATSAPP_TEMPLATE_STATUS } from '@/settings/accounts/graphql/mutations/whatsappTemplateMutations';
import { GET_MY_WHATSAPP_TEMPLATES } from '@/settings/accounts/graphql/queries/getMyWhatsappTemplates';
import { useApolloClient, useMutation } from '@apollo/client/react';
import { useCallback } from 'react';

export const useRefreshWhatsappTemplateStatus = () => {
  const apolloClient = useApolloClient();

  const [refreshMutation, { loading }] = useMutation<{
    refreshWhatsappTemplateStatus: WhatsappTemplate;
  }>(REFRESH_WHATSAPP_TEMPLATE_STATUS, {
    client: apolloClient,
    refetchQueries: [GET_MY_WHATSAPP_TEMPLATES],
  });

  const refreshWhatsappTemplateStatus = useCallback(
    async (id: string) => {
      await refreshMutation({ variables: { id } });
    },
    [refreshMutation],
  );

  return { refreshWhatsappTemplateStatus, loading };
};
