import { gql } from '@apollo/client';

export const GET_WHATSAPP_THREAD_ID_FOR_PERSON = gql`
  query GetWhatsappThreadIdForPerson($personId: UUID!) {
    getWhatsappThreadIdForPerson(personId: $personId)
  }
`;
