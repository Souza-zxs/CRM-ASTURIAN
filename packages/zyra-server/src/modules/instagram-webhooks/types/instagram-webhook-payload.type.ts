// Shape of the payload Meta POSTs to the webhook for the `comments` field
// subscription. See https://developers.facebook.com/docs/instagram-platform/webhooks#comments
export type InstagramWebhookPayload = {
  object: string;
  entry: InstagramWebhookEntry[];
};

export type InstagramWebhookEntry = {
  id: string;
  time: number;
  changes: InstagramWebhookChange[];
};

export type InstagramWebhookChange = {
  field: string;
  value: InstagramWebhookCommentValue;
};

export type InstagramWebhookCommentValue = {
  from: { id: string; username?: string };
  media: { id: string; media_product_type?: string };
  id: string;
  text: string;
  // Present when the event is a reply to another comment rather than a
  // top-level comment on the post — not matched against automation rules.
  parent_id?: string;
};
