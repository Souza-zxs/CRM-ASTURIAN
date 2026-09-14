import { gql } from '@apollo/client';

export const CREATE_INSTAGRAM_AUTOMATION_RULE = gql`
  mutation CreateInstagramAutomationRule(
    $input: CreateInstagramAutomationRuleInput!
  ) {
    createInstagramAutomationRule(input: $input) {
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

export const UPDATE_INSTAGRAM_AUTOMATION_RULE = gql`
  mutation UpdateInstagramAutomationRule(
    $input: UpdateInstagramAutomationRuleInput!
  ) {
    updateInstagramAutomationRule(input: $input) {
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
      updatedAt
    }
  }
`;

export const DELETE_INSTAGRAM_AUTOMATION_RULE = gql`
  mutation DeleteInstagramAutomationRule($id: UUID!) {
    deleteInstagramAutomationRule(id: $id) {
      id
    }
  }
`;
