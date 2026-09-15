import { type WhatsappTemplate, type WhatsappTemplateButton } from '@/accounts/types/WhatsappTemplate';
import { CREATE_WHATSAPP_TEMPLATE } from '@/settings/accounts/graphql/mutations/whatsappTemplateMutations';
import { GET_MY_WHATSAPP_TEMPLATES } from '@/settings/accounts/graphql/queries/getMyWhatsappTemplates';
import { useApolloClient, useMutation } from '@apollo/client/react';
import { useCallback } from 'react';

export type CreateWhatsappTemplateInput = {
  whatsappChannelId: string;
  name: string;
  category: 'MARKETING' | 'UTILITY' | 'AUTHENTICATION';
  language: string;
  headerText?: string | null;
  bodyText: string;
  footerText?: string | null;
  buttons?: WhatsappTemplateButton[] | null;
};

export const useCreateWhatsappTemplate = () => {
  const apolloClient = useApolloClient();

  const [createWhatsappTemplateMutation, { loading }] = useMutation<{
    createWhatsappTemplate: WhatsappTemplate;
  }>(CREATE_WHATSAPP_TEMPLATE, {
    client: apolloClient,
    refetchQueries: [GET_MY_WHATSAPP_TEMPLATES],
  });

  const createWhatsappTemplate = useCallback(
    async (input: CreateWhatsappTemplateInput) => {
      await createWhatsappTemplateMutation({ variables: { input } });
    },
    [createWhatsappTemplateMutation],
  );

  return { createWhatsappTemplate, loading };
};
