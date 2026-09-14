import { gql } from '@apollo/client';

export const DUPLICATE_INSTAGRAM_AUTOMATION_RULE = gql`
  mutation DuplicateInstagramAutomationRule($id: UUID!) {
    duplicateInstagramAutomationRule(id: $id) {
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

export const IMPORT_INSTAGRAM_AUTOMATION_RULES_FROM_CSV = gql`
  mutation ImportInstagramAutomationRulesFromCsv(
    $instagramChannelId: UUID!
    $csvContent: String!
  ) {
    importInstagramAutomationRulesFromCsv(
      instagramChannelId: $instagramChannelId
      csvContent: $csvContent
    ) {
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
