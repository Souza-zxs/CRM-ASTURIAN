export enum WhatsappTemplateButtonType {
  QUICK_REPLY = 'QUICK_REPLY',
  URL = 'URL',
  PHONE_NUMBER = 'PHONE_NUMBER',
}

export type WhatsappTemplateButton = {
  type: WhatsappTemplateButtonType;
  text: string;
  url?: string;
  phoneNumber?: string;
};
