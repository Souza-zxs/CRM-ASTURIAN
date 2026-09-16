export type WhatsappTemplateButton = {
  type: 'QUICK_REPLY' | 'URL' | 'PHONE_NUMBER';
  text: string;
  url?: string;
  phoneNumber?: string;
};

export type WhatsappTemplate = {
  id: string;
  whatsappChannelId: string;
  name: string;
  category: 'MARKETING' | 'UTILITY' | 'AUTHENTICATION';
  language: string;
  headerText: string | null;
  bodyText: string;
  footerText: string | null;
  buttons: WhatsappTemplateButton[] | null;
  status: 'DRAFT' | 'PENDING' | 'APPROVED' | 'REJECTED';
  metaTemplateId: string | null;
  metaTemplateStatus: string | null;
  rejectionReason: string | null;
  createdAt: string;
  updatedAt: string;
  __typename: 'WhatsappTemplate';
};
