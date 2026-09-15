import { gql } from '@apollo/client';

const WHATSAPP_TEMPLATE_FIELDS = `
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
`;

export const CREATE_WHATSAPP_TEMPLATE = gql`
  mutation CreateWhatsappTemplate($input: CreateWhatsappTemplateInput!) {
    createWhatsappTemplate(input: $input) {
      ${WHATSAPP_TEMPLATE_FIELDS}
    }
  }
`;

export const UPDATE_WHATSAPP_TEMPLATE = gql`
  mutation UpdateWhatsappTemplate($input: UpdateWhatsappTemplateInput!) {
    updateWhatsappTemplate(input: $input) {
      ${WHATSAPP_TEMPLATE_FIELDS}
    }
  }
`;

export const DELETE_WHATSAPP_TEMPLATE = gql`
  mutation DeleteWhatsappTemplate($id: UUID!) {
    deleteWhatsappTemplate(id: $id)
  }
`;

export const SUBMIT_WHATSAPP_TEMPLATE_FOR_APPROVAL = gql`
  mutation SubmitWhatsappTemplateForApproval($id: UUID!) {
    submitWhatsappTemplateForApproval(id: $id) {
      ${WHATSAPP_TEMPLATE_FIELDS}
    }
  }
`;

export const REFRESH_WHATSAPP_TEMPLATE_STATUS = gql`
  mutation RefreshWhatsappTemplateStatus($id: UUID!) {
    refreshWhatsappTemplateStatus(id: $id) {
      ${WHATSAPP_TEMPLATE_FIELDS}
    }
  }
`;
