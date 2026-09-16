import { type WhatsappTemplate } from '@/accounts/types/WhatsappTemplate';
import { SUBMIT_WHATSAPP_TEMPLATE_FOR_APPROVAL } from '@/settings/accounts/graphql/mutations/whatsappTemplateMutations';
import { GET_MY_WHATSAPP_TEMPLATES } from '@/settings/accounts/graphql/queries/getMyWhatsappTemplates';
import { useApolloClient, useMutation } from '@apollo/client/react';
import { useCallback } from 'react';

export const useSubmitWhatsappTemplateForApproval = () => {
  const apolloClient = useApolloClient();

  const [submitMutation, { loading }] = useMutation<{
    submitWhatsappTemplateForApproval: WhatsappTemplate;
  }>(SUBMIT_WHATSAPP_TEMPLATE_FOR_APPROVAL, {
    client: apolloClient,
    refetchQueries: [GET_MY_WHATSAPP_TEMPLATES],
  });

  const submitWhatsappTemplateForApproval = useCallback(
    async (id: string) => {
      await submitMutation({ variables: { id } });
    },
    [submitMutation],
  );

  return { submitWhatsappTemplateForApproval, loading };
};
