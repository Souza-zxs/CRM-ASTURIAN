import { DELETE_WHATSAPP_TEMPLATE } from '@/settings/accounts/graphql/mutations/whatsappTemplateMutations';
import { GET_MY_WHATSAPP_TEMPLATES } from '@/settings/accounts/graphql/queries/getMyWhatsappTemplates';
import { useApolloClient, useMutation } from '@apollo/client/react';
import { useCallback } from 'react';

export const useDeleteWhatsappTemplate = () => {
  const apolloClient = useApolloClient();

  const [deleteWhatsappTemplateMutation, { loading }] = useMutation<{
    deleteWhatsappTemplate: boolean;
  }>(DELETE_WHATSAPP_TEMPLATE, {
    client: apolloClient,
    refetchQueries: [GET_MY_WHATSAPP_TEMPLATES],
  });

  const deleteWhatsappTemplate = useCallback(
    async (id: string) => {
      await deleteWhatsappTemplateMutation({ variables: { id } });
    },
    [deleteWhatsappTemplateMutation],
  );

  return { deleteWhatsappTemplate, loading };
};
