import { type WhatsappTemplate, type WhatsappTemplateButton } from '@/accounts/types/WhatsappTemplate';
import { UPDATE_WHATSAPP_TEMPLATE } from '@/settings/accounts/graphql/mutations/whatsappTemplateMutations';
import { GET_MY_WHATSAPP_TEMPLATES } from '@/settings/accounts/graphql/queries/getMyWhatsappTemplates';
import { useApolloClient, useMutation } from '@apollo/client/react';
import { useCallback } from 'react';

export type UpdateWhatsappTemplateInput = {
  id: string;
  name?: string;
  category?: 'MARKETING' | 'UTILITY' | 'AUTHENTICATION';
  language?: string;
  headerText?: string | null;
  bodyText?: string;
  footerText?: string | null;
  buttons?: WhatsappTemplateButton[] | null;
};

export const useUpdateWhatsappTemplate = () => {
  const apolloClient = useApolloClient();

  const [updateWhatsappTemplateMutation, { loading }] = useMutation<{
    updateWhatsappTemplate: WhatsappTemplate;
  }>(UPDATE_WHATSAPP_TEMPLATE, {
    client: apolloClient,
    refetchQueries: [GET_MY_WHATSAPP_TEMPLATES],
  });

  const updateWhatsappTemplate = useCallback(
    async (input: UpdateWhatsappTemplateInput) => {
      await updateWhatsappTemplateMutation({ variables: { input } });
    },
    [updateWhatsappTemplateMutation],
  );

  return { updateWhatsappTemplate, loading };
};
