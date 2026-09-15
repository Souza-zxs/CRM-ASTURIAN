import { gql } from '@apollo/client';

export const GET_MY_WHATSAPP_TEMPLATES = gql`
  query MyWhatsappTemplates {
    myWhatsappTemplates {
      id
      whatsappChannelId
      name
      category
      language
      headerText
      bodyText
      footerText
      buttons
      status
      metaTemplateId
      metaTemplateStatus
      rejectionReason
      createdAt
      updatedAt
    }
  }
`;
