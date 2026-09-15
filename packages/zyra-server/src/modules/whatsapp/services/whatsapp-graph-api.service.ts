import { Injectable, Logger } from '@nestjs/common';

import axios, { isAxiosError } from 'axios';

import { ZyraConfigService } from 'src/engine/core-modules/zyra-config/zyra-config.service';
import { WHATSAPP_GRAPH_API_BASE_URL } from 'src/modules/whatsapp/constants/whatsapp-graph-api.constant';
import {
  WhatsappException,
  WhatsappExceptionCode,
} from 'src/modules/whatsapp/types/whatsapp.exception';

export type WhatsappPhoneNumberDetails = {
  id: string;
  display_phone_number: string;
  verified_name: string;
};

export type WhatsappEmbeddedSignupExchange = {
  wabaId: string;
  phoneNumberId: string;
  systemUserAccessToken: string;
};

export type WhatsappTemplateComponent =
  | { type: 'HEADER'; format: 'TEXT'; text: string }
  | { type: 'BODY'; text: string }
  | { type: 'FOOTER'; text: string }
  | {
      type: 'BUTTONS';
      buttons: Array<
        | { type: 'QUICK_REPLY'; text: string }
        | { type: 'URL'; text: string; url: string }
        | { type: 'PHONE_NUMBER'; text: string; phone_number: string }
      >;
    };

export type CreateWhatsappTemplatePayload = {
  name: string;
  category: 'MARKETING' | 'UTILITY' | 'AUTHENTICATION';
  language: string;
  components: WhatsappTemplateComponent[];
};

export type WhatsappTemplateRemoteStatus = {
  id: string;
  status: string;
  category: string;
  rejectedReason?: string;
};

// Thin wrapper over the Graph API endpoints the Embedded Signup + messaging
// flows need. No official Meta Node SDK exists for this product — every
// integration guide in Meta's own docs calls the REST API directly, so this
// mirrors that rather than inventing an SDK-shaped abstraction.
@Injectable()
export class WhatsappGraphApiService {
  private readonly logger = new Logger(WhatsappGraphApiService.name);

  constructor(private readonly zyraConfigService: ZyraConfigService) {}

  // Step 2 of Embedded Signup: exchange the short-lived `code` the front-end
  // received from FB.login() for a system-user access token scoped to the
  // WABA the client just authorized. See:
  // https://developers.facebook.com/docs/whatsapp/embedded-signup
  async exchangeEmbeddedSignupCode(
    code: string,
    wabaId: string,
    phoneNumberId: string,
  ): Promise<WhatsappEmbeddedSignupExchange> {
    const appId = this.zyraConfigService.get('WHATSAPP_APP_ID');
    const appSecret = this.zyraConfigService.get('WHATSAPP_APP_SECRET');

    try {
      const response = await axios.get<{ access_token: string }>(
        `${WHATSAPP_GRAPH_API_BASE_URL}/oauth/access_token`,
        {
          params: {
            client_id: appId,
            client_secret: appSecret,
            code,
          },
        },
      );

      return {
        wabaId,
        phoneNumberId,
        systemUserAccessToken: response.data.access_token,
      };
    } catch (error) {
      const details = isAxiosError(error)
        ? JSON.stringify(error.response?.data)
        : error;

      this.logger.error(`Embedded Signup code exchange failed: ${details}`);
      throw new WhatsappException(
        'Failed to exchange Embedded Signup code for an access token',
        WhatsappExceptionCode.WHATSAPP_EMBEDDED_SIGNUP_FAILED,
      );
    }
  }

  async getPhoneNumberDetails(
    phoneNumberId: string,
    systemUserAccessToken: string,
  ): Promise<WhatsappPhoneNumberDetails> {
    try {
      const response = await axios.get<WhatsappPhoneNumberDetails>(
        `${WHATSAPP_GRAPH_API_BASE_URL}/${phoneNumberId}`,
        {
          params: { fields: 'id,display_phone_number,verified_name' },
          headers: { Authorization: `Bearer ${systemUserAccessToken}` },
        },
      );

      return response.data;
    } catch (error) {
      const details = isAxiosError(error)
        ? JSON.stringify(error.response?.data)
        : error;

      this.logger.error(
        `Failed to fetch phone number details for ${phoneNumberId}: ${details}`,
      );
      throw new WhatsappException(
        `Failed to fetch WhatsApp phone number details for ${phoneNumberId}`,
        WhatsappExceptionCode.WHATSAPP_EMBEDDED_SIGNUP_FAILED,
      );
    }
  }

  // Sends a free-form text message. Outside the 24h customer-service window
  // Meta rejects this and requires a pre-approved template — that flow isn't
  // implemented yet (see the WhatsApp Cloud API plan's open follow-ups).
  async sendTextMessage(
    phoneNumberId: string,
    systemUserAccessToken: string,
    to: string,
    body: string,
  ): Promise<{ messageExternalId: string }> {
    try {
      const response = await axios.post<{
        messages: { id: string }[];
      }>(
        `${WHATSAPP_GRAPH_API_BASE_URL}/${phoneNumberId}/messages`,
        {
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to,
          type: 'text',
          text: { body },
        },
        { headers: { Authorization: `Bearer ${systemUserAccessToken}` } },
      );

      return { messageExternalId: response.data.messages[0].id };
    } catch (error) {
      const details = isAxiosError(error)
        ? JSON.stringify(error.response?.data)
        : error;

      this.logger.error(
        `Failed to send WhatsApp message via ${phoneNumberId}: ${details}`,
      );
      throw new WhatsappException(
        `Failed to send WhatsApp message via ${phoneNumberId}`,
        WhatsappExceptionCode.WHATSAPP_SEND_FAILED,
      );
    }
  }

  // Submits a message template to Meta for approval. Templates are the only
  // way to message someone outside the 24h customer-service window (see
  // sendTextMessage's note above) — this is what closes that gap.
  // https://developers.facebook.com/docs/whatsapp/business-management-api/message-templates
  async createMessageTemplate(
    wabaId: string,
    systemUserAccessToken: string,
    payload: CreateWhatsappTemplatePayload,
  ): Promise<{ metaTemplateId: string }> {
    try {
      const response = await axios.post<{ id: string }>(
        `${WHATSAPP_GRAPH_API_BASE_URL}/${wabaId}/message_templates`,
        payload,
        { headers: { Authorization: `Bearer ${systemUserAccessToken}` } },
      );

      return { metaTemplateId: response.data.id };
    } catch (error) {
      const details = isAxiosError(error)
        ? JSON.stringify(error.response?.data)
        : error;

      this.logger.error(
        `Failed to create WhatsApp template "${payload.name}" on WABA ${wabaId}: ${details}`,
      );
      throw new WhatsappException(
        `Failed to submit WhatsApp template "${payload.name}" to Meta`,
        WhatsappExceptionCode.WHATSAPP_TEMPLATE_CREATE_FAILED,
      );
    }
  }

  // Polls the current approval status of a previously-submitted template.
  async getMessageTemplateStatus(
    wabaId: string,
    systemUserAccessToken: string,
    metaTemplateId: string,
  ): Promise<WhatsappTemplateRemoteStatus> {
    try {
      const response = await axios.get<WhatsappTemplateRemoteStatus>(
        `${WHATSAPP_GRAPH_API_BASE_URL}/${metaTemplateId}`,
        {
          params: { fields: 'id,status,category,rejected_reason' },
          headers: { Authorization: `Bearer ${systemUserAccessToken}` },
        },
      );

      return response.data;
    } catch (error) {
      const details = isAxiosError(error)
        ? JSON.stringify(error.response?.data)
        : error;

      this.logger.error(
        `Failed to fetch status for WhatsApp template ${metaTemplateId}: ${details}`,
      );
      throw new WhatsappException(
        `Failed to fetch WhatsApp template status for ${metaTemplateId}`,
        WhatsappExceptionCode.WHATSAPP_TEMPLATE_SYNC_FAILED,
      );
    }
  }

  // Sends an approved template message — usable outside the 24h window,
  // unlike sendTextMessage.
  async sendTemplateMessage(
    phoneNumberId: string,
    systemUserAccessToken: string,
    to: string,
    templateName: string,
    language: string,
    bodyParameters: string[] = [],
  ): Promise<{ messageExternalId: string }> {
    try {
      const response = await axios.post<{
        messages: { id: string }[];
      }>(
        `${WHATSAPP_GRAPH_API_BASE_URL}/${phoneNumberId}/messages`,
        {
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to,
          type: 'template',
          template: {
            name: templateName,
            language: { code: language },
            ...(bodyParameters.length > 0
              ? {
                  components: [
                    {
                      type: 'body',
                      parameters: bodyParameters.map((text) => ({
                        type: 'text',
                        text,
                      })),
                    },
                  ],
                }
              : {}),
          },
        },
        { headers: { Authorization: `Bearer ${systemUserAccessToken}` } },
      );

      return { messageExternalId: response.data.messages[0].id };
    } catch (error) {
      const details = isAxiosError(error)
        ? JSON.stringify(error.response?.data)
        : error;

      this.logger.error(
        `Failed to send WhatsApp template "${templateName}" via ${phoneNumberId}: ${details}`,
      );
      throw new WhatsappException(
        `Failed to send WhatsApp template "${templateName}" via ${phoneNumberId}`,
        WhatsappExceptionCode.WHATSAPP_TEMPLATE_SEND_FAILED,
      );
    }
  }
}
