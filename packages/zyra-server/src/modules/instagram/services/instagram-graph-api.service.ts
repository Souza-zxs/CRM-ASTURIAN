import { Injectable, Logger } from '@nestjs/common';

import axios, { isAxiosError } from 'axios';

import { ZyraConfigService } from 'src/engine/core-modules/zyra-config/zyra-config.service';
import {
  INSTAGRAM_GRAPH_API_BASE_URL,
  INSTAGRAM_OAUTH_TOKEN_URL,
} from 'src/modules/instagram/constants/instagram-graph-api.constant';
import {
  InstagramException,
  InstagramExceptionCode,
} from 'src/modules/instagram/types/instagram.exception';

export type InstagramAccountDetails = {
  id: string;
  username: string;
  profile_picture_url?: string;
};

export type InstagramLoginExchange = {
  igUserId: string;
  accessToken: string;
};

export type InstagramLongLivedTokenExchange = {
  accessToken: string;
  expiresInSeconds: number;
};

export type InstagramMediaSummary = {
  id: string;
  caption?: string;
  media_type: string;
  // FEED | REELS | STORY — used by InstagramAttachNextReelCronJob to find
  // the channel's most recent Reel specifically (media_type alone can't
  // tell a Reel apart from a regular VIDEO post).
  media_product_type?: string;
  media_url?: string;
  thumbnail_url?: string;
  permalink: string;
  timestamp: string;
};

export type InstagramCommentSummary = {
  id: string;
  text: string;
  timestamp: string;
  username?: string;
  from?: { id: string; username?: string };
};

// Thin wrapper over the Graph API endpoints the Instagram Login + comment
// automation flows need. No official Meta Node SDK exists for this product —
// every integration guide in Meta's own docs calls the REST API directly, so
// this mirrors WhatsappGraphApiService's approach rather than inventing an
// SDK-shaped abstraction.
@Injectable()
export class InstagramGraphApiService {
  private readonly logger = new Logger(InstagramGraphApiService.name);

  constructor(private readonly zyraConfigService: ZyraConfigService) {}

  // Exchanges the `code` the front-end received from the Instagram
  // authorization redirect for a short-lived access token, scoped to the
  // Instagram professional account the client just authorized. See:
  // https://developers.facebook.com/docs/instagram-platform/instagram-api-with-instagram-login/business-login-for-instagram
  async exchangeLoginCode(code: string): Promise<InstagramLoginExchange> {
    const appId = this.zyraConfigService.get('INSTAGRAM_APP_ID');
    const appSecret = this.zyraConfigService.get('INSTAGRAM_APP_SECRET');
    const redirectUri = this.zyraConfigService.get(
      'INSTAGRAM_OAUTH_REDIRECT_URI',
    );

    try {
      const response = await axios.post<{
        access_token: string;
        user_id: string;
      }>(
        INSTAGRAM_OAUTH_TOKEN_URL,
        new URLSearchParams({
          client_id: appId,
          client_secret: appSecret,
          grant_type: 'authorization_code',
          redirect_uri: redirectUri,
          code,
        }),
      );

      return {
        igUserId: response.data.user_id,
        accessToken: response.data.access_token,
      };
    } catch (error) {
      const details = isAxiosError(error)
        ? JSON.stringify(error.response?.data)
        : error;

      this.logger.error(`Instagram Login code exchange failed: ${details}`);
      throw new InstagramException(
        'Failed to exchange Instagram Login code for an access token',
        InstagramExceptionCode.INSTAGRAM_LOGIN_FAILED,
      );
    }
  }

  // Exchanges the ~1h short-lived token from exchangeLoginCode for a 60-day
  // long-lived token. Must be called once right after login — the
  // short-lived token is otherwise too short-lived to be useful for
  // anything but this exchange. See:
  // https://developers.facebook.com/docs/instagram-platform/instagram-api-with-instagram-login/business-login-for-instagram#step-3--exchange-short-lived-tokens-for-long-lived-tokens
  async exchangeForLongLivedToken(
    shortLivedAccessToken: string,
  ): Promise<InstagramLongLivedTokenExchange> {
    const appSecret = this.zyraConfigService.get('INSTAGRAM_APP_SECRET');

    try {
      const response = await axios.get<{
        access_token: string;
        expires_in: number;
      }>(`${INSTAGRAM_GRAPH_API_BASE_URL}/access_token`, {
        params: {
          grant_type: 'ig_exchange_token',
          client_secret: appSecret,
          access_token: shortLivedAccessToken,
        },
      });

      return {
        accessToken: response.data.access_token,
        expiresInSeconds: response.data.expires_in,
      };
    } catch (error) {
      const details = isAxiosError(error)
        ? JSON.stringify(error.response?.data)
        : error;

      this.logger.error(
        `Failed to exchange Instagram token for a long-lived token: ${details}`,
      );
      throw new InstagramException(
        'Failed to exchange Instagram token for a long-lived token',
        InstagramExceptionCode.INSTAGRAM_LOGIN_FAILED,
      );
    }
  }

  // Refreshes a long-lived token for another 60 days. Meta requires the
  // token to still have at least 24h of validity left when this is called,
  // so callers should refresh well before expiresAt. See:
  // https://developers.facebook.com/docs/instagram-platform/instagram-api-with-instagram-login/business-login-for-instagram#step-4--refresh-long-lived-tokens
  async refreshLongLivedToken(
    longLivedAccessToken: string,
  ): Promise<InstagramLongLivedTokenExchange> {
    try {
      const response = await axios.get<{
        access_token: string;
        expires_in: number;
      }>(`${INSTAGRAM_GRAPH_API_BASE_URL}/refresh_access_token`, {
        params: {
          grant_type: 'ig_refresh_token',
          access_token: longLivedAccessToken,
        },
      });

      return {
        accessToken: response.data.access_token,
        expiresInSeconds: response.data.expires_in,
      };
    } catch (error) {
      const details = isAxiosError(error)
        ? JSON.stringify(error.response?.data)
        : error;

      this.logger.error(`Failed to refresh Instagram long-lived token: ${details}`);
      throw new InstagramException(
        'Failed to refresh Instagram long-lived token',
        InstagramExceptionCode.INSTAGRAM_LOGIN_FAILED,
      );
    }
  }

  async getAccountDetails(
    igUserId: string,
    accessToken: string,
  ): Promise<InstagramAccountDetails> {
    try {
      const response = await axios.get<InstagramAccountDetails>(
        `${INSTAGRAM_GRAPH_API_BASE_URL}/${igUserId}`,
        {
          params: { fields: 'id,username,profile_picture_url' },
          headers: { Authorization: `Bearer ${accessToken}` },
        },
      );

      return response.data;
    } catch (error) {
      const details = isAxiosError(error)
        ? JSON.stringify(error.response?.data)
        : error;

      this.logger.error(
        `Failed to fetch Instagram account details for ${igUserId}: ${details}`,
      );
      throw new InstagramException(
        `Failed to fetch Instagram account details for ${igUserId}`,
        InstagramExceptionCode.INSTAGRAM_LOGIN_FAILED,
      );
    }
  }

  // Lists recent media so the settings UI can offer a post picker when
  // creating a comment-automation rule.
  async listRecentMedia(
    igUserId: string,
    accessToken: string,
  ): Promise<InstagramMediaSummary[]> {
    try {
      const response = await axios.get<{ data: InstagramMediaSummary[] }>(
        `${INSTAGRAM_GRAPH_API_BASE_URL}/${igUserId}/media`,
        {
          params: {
            fields:
              'id,caption,media_type,media_product_type,media_url,thumbnail_url,permalink,timestamp',
            limit: 25,
          },
          headers: { Authorization: `Bearer ${accessToken}` },
        },
      );

      return response.data.data;
    } catch (error) {
      const details = isAxiosError(error)
        ? JSON.stringify(error.response?.data)
        : error;

      this.logger.error(
        `Failed to list Instagram media for ${igUserId}: ${details}`,
      );
      throw new InstagramException(
        `Failed to list Instagram media for ${igUserId}`,
        InstagramExceptionCode.INSTAGRAM_LOGIN_FAILED,
      );
    }
  }

  // Sends a "private reply" to a comment — the only messaging surface Meta
  // allows for triggering a DM from a comment, valid for 7 days after the
  // comment was made and usable only once per comment. See:
  // https://developers.facebook.com/docs/instagram-platform/instagram-api-with-instagram-login/private-replies
  async sendPrivateReplyToComment(
    igBusinessAccountId: string,
    accessToken: string,
    commentId: string,
    message: string,
  ): Promise<{ messageExternalId: string }> {
    try {
      const response = await axios.post<{ id: string }>(
        `${INSTAGRAM_GRAPH_API_BASE_URL}/${igBusinessAccountId}/messages`,
        {
          recipient: { comment_id: commentId },
          message: { text: message },
        },
        { headers: { Authorization: `Bearer ${accessToken}` } },
      );

      return { messageExternalId: response.data.id };
    } catch (error) {
      const details = isAxiosError(error)
        ? JSON.stringify(error.response?.data)
        : error;

      this.logger.error(
        `Failed to send Instagram private reply for comment ${commentId}: ${details}`,
      );
      throw new InstagramException(
        `Failed to send Instagram private reply for comment ${commentId}`,
        InstagramExceptionCode.INSTAGRAM_SEND_FAILED,
      );
    }
  }

  // Posts a PUBLIC, visible reply under the triggering comment — distinct
  // from sendPrivateReplyToComment (which sends a DM). Used to post one of
  // publicReplyVariations so the automation nudges the commenter to check
  // their DMs without looking like it's repeating a canned phrase. See:
  // https://developers.facebook.com/docs/instagram-platform/instagram-api-with-instagram-login/comment-moderation#reply-to-a-comment
  async postPublicReplyToComment(
    commentId: string,
    accessToken: string,
    message: string,
  ): Promise<{ replyCommentId: string }> {
    try {
      const response = await axios.post<{ id: string }>(
        `${INSTAGRAM_GRAPH_API_BASE_URL}/${commentId}/replies`,
        { message },
        { headers: { Authorization: `Bearer ${accessToken}` } },
      );

      return { replyCommentId: response.data.id };
    } catch (error) {
      const details = isAxiosError(error)
        ? JSON.stringify(error.response?.data)
        : error;

      this.logger.error(
        `Failed to post Instagram public reply for comment ${commentId}: ${details}`,
      );
      throw new InstagramException(
        `Failed to post Instagram public reply for comment ${commentId}`,
        InstagramExceptionCode.INSTAGRAM_SEND_FAILED,
      );
    }
  }

  // Standard Send API message, addressed by recipient IGSID rather than
  // comment_id — unlike sendPrivateReplyToComment, this can be used more
  // than once, but only works within Meta's standard messaging window
  // (~24h since the user last messaged the business, with some tag-based
  // exceptions that don't apply here). Used for the delayed follow-up DM,
  // which is a known, documented limitation: if the recipient hasn't
  // interacted since the private reply, the follow-up call can fail with a
  // window-closed error — InstagramFollowUpDmJob logs and swallows that
  // rather than retrying forever. See:
  // https://developers.facebook.com/docs/instagram-platform/instagram-api-with-instagram-login/messaging
  async sendDirectMessage(
    igBusinessAccountId: string,
    accessToken: string,
    recipientIgsid: string,
    message: string,
  ): Promise<{ messageExternalId: string }> {
    try {
      const response = await axios.post<{ id: string }>(
        `${INSTAGRAM_GRAPH_API_BASE_URL}/${igBusinessAccountId}/messages`,
        {
          recipient: { id: recipientIgsid },
          message: { text: message },
        },
        { headers: { Authorization: `Bearer ${accessToken}` } },
      );

      return { messageExternalId: response.data.id };
    } catch (error) {
      const details = isAxiosError(error)
        ? JSON.stringify(error.response?.data)
        : error;

      this.logger.error(
        `Failed to send Instagram direct message to ${recipientIgsid}: ${details}`,
      );
      throw new InstagramException(
        `Failed to send Instagram direct message to ${recipientIgsid}`,
        InstagramExceptionCode.INSTAGRAM_SEND_FAILED,
      );
    }
  }

  // Lists recent top-level comments on a media item — used by
  // InstagramCommentReconciliationCronJob as a safety net for comments a
  // webhook delivery never reached us for.
  async listMediaComments(
    mediaId: string,
    accessToken: string,
  ): Promise<InstagramCommentSummary[]> {
    try {
      const response = await axios.get<{ data: InstagramCommentSummary[] }>(
        `${INSTAGRAM_GRAPH_API_BASE_URL}/${mediaId}/comments`,
        {
          params: {
            fields: 'id,text,timestamp,username',
            limit: 50,
          },
          headers: { Authorization: `Bearer ${accessToken}` },
        },
      );

      return response.data.data;
    } catch (error) {
      const details = isAxiosError(error)
        ? JSON.stringify(error.response?.data)
        : error;

      this.logger.error(
        `Failed to list Instagram comments for media ${mediaId}: ${details}`,
      );
      throw new InstagramException(
        `Failed to list Instagram comments for media ${mediaId}`,
        InstagramExceptionCode.INSTAGRAM_SEND_FAILED,
      );
    }
  }

  // Total follower count for the connected professional account — used by
  // InstagramFollowerSnapshotCronJob for the daily growth snapshot. See:
  // https://developers.facebook.com/docs/instagram-platform/instagram-graph-api/reference/ig-user#fields
  async getFollowerCount(
    igUserId: string,
    accessToken: string,
  ): Promise<number> {
    try {
      const response = await axios.get<{ followers_count: number }>(
        `${INSTAGRAM_GRAPH_API_BASE_URL}/${igUserId}`,
        {
          params: { fields: 'followers_count' },
          headers: { Authorization: `Bearer ${accessToken}` },
        },
      );

      return response.data.followers_count;
    } catch (error) {
      const details = isAxiosError(error)
        ? JSON.stringify(error.response?.data)
        : error;

      this.logger.error(
        `Failed to fetch Instagram follower count for ${igUserId}: ${details}`,
      );
      throw new InstagramException(
        `Failed to fetch Instagram follower count for ${igUserId}`,
        InstagramExceptionCode.INSTAGRAM_LOGIN_FAILED,
      );
    }
  }

  // Best-effort "follow gate" check for requiresFollowToReceiveDm. KNOWN
  // LIMITATION: Meta does not expose a general "does IGSID X follow
  // business account Y" endpoint for Instagram API with Instagram Login.
  // The only documented signal close to this is the Messaging User Profile
  // API's `is_user_follow_business` field
  // (https://developers.facebook.com/docs/instagram-platform/instagram-api-with-instagram-login/user-profile),
  // which is only populated once a messaging conversation already exists
  // with that user (which — for a comment automation — it typically does
  // not, until we send the private reply ourselves). Because of that
  // chicken-and-egg problem, this returns `null` ("unknown") on anything
  // other than an explicit true/false from Meta, and callers must treat
  // `null` as "allow" per the product spec (never block a real send on an
  // API limitation).
  async checkIsUserFollowingBusiness(
    recipientIgsid: string,
    accessToken: string,
  ): Promise<boolean | null> {
    try {
      const response = await axios.get<{
        is_user_follow_business?: boolean;
      }>(`${INSTAGRAM_GRAPH_API_BASE_URL}/${recipientIgsid}`, {
        params: { fields: 'is_user_follow_business' },
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      return response.data.is_user_follow_business ?? null;
    } catch (error) {
      const details = isAxiosError(error)
        ? JSON.stringify(error.response?.data)
        : error;

      this.logger.warn(
        `Could not determine follow status for ${recipientIgsid}, defaulting to "unknown": ${details}`,
      );

      return null;
    }
  }
}
