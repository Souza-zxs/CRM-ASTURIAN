import { gql } from '@apollo/client';

export const GET_INSTAGRAM_CAMPAIGN_TEMPLATES = gql`
  query InstagramCampaignTemplates {
    instagramCampaignTemplates {
      key
      name
      description
      suggestedKeywords
      suggestedReplyMessage
      suggestedPublicReplyVariations
      suggestedFollowUpMessage
    }
  }
`;
