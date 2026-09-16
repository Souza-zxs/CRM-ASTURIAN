import { gql } from '@apollo/client';

export const GET_MY_WHATSAPP_CHANNELS = gql`
  query MyWhatsappChannels {
    myWhatsappChannels {
      id
      connectedAccountId
      phoneNumberId
      wabaId
      displayPhoneNumber
      isSyncEnabled
      syncStatus
      createdAt
      updatedAt
    }
  }
`;
