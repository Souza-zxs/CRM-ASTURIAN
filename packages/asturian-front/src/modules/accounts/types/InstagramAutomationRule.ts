export type InstagramAutomationRule = {
  id: string;
  instagramChannelId: string;
  name: string | null;
  // Null while the campaign is pending attachment to the next published
  // Reel (see attachToNextReel).
  igMediaId: string | null;
  igMediaCaption: string | null;
  igMediaThumbnailUrl: string | null;
  igMediaPermalink: string | null;
  keywords: string[];
  replyMessage: string;
  publicReplyVariations: string[] | null;
  requiresFollowToReceiveDm: boolean;
  followUpMessage: string | null;
  followUpDelayMinutes: number | null;
  attachToNextReel: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  __typename: 'InstagramAutomationRule';
};

export type InstagramMediaSummary = {
  id: string;
  caption: string | null;
  thumbnailUrl: string | null;
  permalink: string;
  __typename: 'InstagramMediaSummary';
};
