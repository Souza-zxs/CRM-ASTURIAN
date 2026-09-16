import { gql } from '@apollo/client';

export const GET_INSTAGRAM_AUTOMATION_RULES = gql`
  query InstagramAutomationRules($instagramChannelId: UUID!) {
    instagramAutomationRules(instagramChannelId: $instagramChannelId) {
      id
      instagramChannelId
      name
      igMediaId
      igMediaCaption
      igMediaThumbnailUrl
      igMediaPermalink
      keywords
      replyMessage
      publicReplyVariations
      requiresFollowToReceiveDm
      followUpMessage
      followUpDelayMinutes
      attachToNextReel
      isActive
      createdAt
      updatedAt
    }
  }
`;
