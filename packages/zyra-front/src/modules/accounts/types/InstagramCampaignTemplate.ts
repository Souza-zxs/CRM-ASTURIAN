export type InstagramCampaignTemplate = {
  key: string;
  name: string;
  description: string;
  suggestedKeywords: string[];
  suggestedReplyMessage: string;
  suggestedPublicReplyVariations: string[];
  suggestedFollowUpMessage: string | null;
  __typename: 'InstagramCampaignTemplateDTO';
};
