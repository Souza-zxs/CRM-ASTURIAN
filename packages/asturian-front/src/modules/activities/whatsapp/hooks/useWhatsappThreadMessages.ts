import { fetchAllThreadMessagesOperationSignatureFactory } from '@/activities/emails/graphql/operation-signatures/factories/fetchAllThreadMessagesOperationSignatureFactory';
import { type WhatsappThreadMessage } from '@/activities/whatsapp/types/WhatsappThreadMessage';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';

export const useWhatsappThreadMessages = (messageThreadId: string | null) => {
  const operationSignature = fetchAllThreadMessagesOperationSignatureFactory({
    messageThreadId,
  });

  const { records: messages, loading } =
    useFindManyRecords<WhatsappThreadMessage & { __typename: string }>({
      limit: operationSignature.variables.limit,
      filter: operationSignature.variables.filter,
      objectNameSingular: operationSignature.objectNameSingular,
      orderBy: operationSignature.variables.orderBy,
      recordGqlFields: operationSignature.fields,
      skip: !messageThreadId,
    });

  return { messages, loading };
};
