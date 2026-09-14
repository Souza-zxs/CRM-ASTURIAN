// Shape of the payload Meta POSTs to the webhook for the `messages` field
// subscription. See https://developers.facebook.com/docs/whatsapp/cloud-api/webhooks/payload-examples
export type WhatsappWebhookPayload = {
  object: string;
  entry: WhatsappWebhookEntry[];
};

export type WhatsappWebhookEntry = {
  id: string;
  changes: WhatsappWebhookChange[];
};

export type WhatsappWebhookChange = {
  field: string;
  value: WhatsappWebhookChangeValue;
};

export type WhatsappWebhookChangeValue = {
  messaging_product: 'whatsapp';
  metadata: {
    display_phone_number: string;
    phone_number_id: string;
  };
  contacts?: {
    profile: { name: string };
    wa_id: string;
  }[];
  messages?: WhatsappInboundMessage[];
  // Delivery/read receipts for messages we sent — not chat content.
  // Not handled yet (see plan follow-ups).
  statuses?: unknown[];
};

export type WhatsappInboundMessage = {
  from: string;
  id: string;
  timestamp: string;
  type: string;
  text?: { body: string };
};
