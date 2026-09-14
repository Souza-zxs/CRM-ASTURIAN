import { Injectable, Logger } from '@nestjs/common';

import { isNonEmptyString } from '@sniptt/guards';
import axios, { isAxiosError } from 'axios';

import { WhatsappAgentMessageDirection } from 'src/engine/metadata-modules/whatsapp-agent/types/whatsapp-agent-message-direction.enum';
import {
  type OpenAiResponsesPayload,
  type WhatsappAgentQualificationResult,
} from 'src/modules/whatsapp-agent/types/whatsapp-agent-qualification-result.type';

export type WhatsappAgentHistoryMessage = {
  direction: WhatsappAgentMessageDirection;
  content: string;
};

const OPENAI_RESPONSES_API_URL = 'https://api.openai.com/v1/responses';

// json_schema (Structured Outputs) requested from the Responses API — same
// "reply text + qualification fields in one JSON object" approach as
// crm-imobiliario's lead-agent.ts, trimmed to what WhatsappAgentResponderService
// actually acts on (score/stage kept for the conversation's qualificationSummary,
// isQualified/wantsHumanHandoff drive behavior).
const QUALIFICATION_JSON_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: [
    'reply',
    'score',
    'stage',
    'summary',
    'isQualified',
    'wantsHumanHandoff',
  ],
  properties: {
    reply: { type: 'string' },
    score: { type: 'integer', minimum: 0, maximum: 100 },
    stage: { type: 'string' },
    summary: { type: 'string' },
    isQualified: { type: 'boolean' },
    wantsHumanHandoff: { type: 'boolean' },
  },
};

// Thin wrapper over the OpenAI Responses API — plain axios call, no SDK, same
// approach crm-imobiliario's lead-agent.ts takes with a raw fetch. Returns
// null (never throws) on any failure so the caller can fall back to "don't
// send an automated reply" without derailing the WhatsApp inbound pipeline.
@Injectable()
export class WhatsappAgentOpenAiClientService {
  private readonly logger = new Logger(WhatsappAgentOpenAiClientService.name);

  async getQualifiedReply({
    apiKey,
    model,
    instructions,
    contactPhoneNumber,
    history,
  }: {
    apiKey: string;
    model: string;
    instructions: string;
    contactPhoneNumber: string;
    history: WhatsappAgentHistoryMessage[];
  }): Promise<WhatsappAgentQualificationResult | null> {
    try {
      const response = await axios.post<OpenAiResponsesPayload>(
        OPENAI_RESPONSES_API_URL,
        {
          model,
          input: [
            { role: 'system', content: instructions },
            {
              role: 'user',
              content: JSON.stringify({
                contactPhoneNumber,
                messages: history.map((message) => ({
                  direction: message.direction,
                  content: message.content,
                })),
              }),
            },
          ],
          text: {
            format: {
              type: 'json_schema',
              name: 'whatsapp_agent_reply',
              schema: QUALIFICATION_JSON_SCHEMA,
            },
          },
        },
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
        },
      );

      const outputText = this.extractOutputText(response.data);

      if (!isNonEmptyString(outputText)) {
        this.logger.error(
          'OpenAI Responses API call succeeded but returned no output text',
        );

        return null;
      }

      return this.normalizeQualificationResult(JSON.parse(outputText));
    } catch (error) {
      const details = isAxiosError(error)
        ? JSON.stringify(error.response?.data)
        : error;

      this.logger.error(
        `Failed to get a WhatsApp agent reply from OpenAI: ${details}`,
      );

      return null;
    }
  }

  private extractOutputText(payload: OpenAiResponsesPayload): string | null {
    if (isNonEmptyString(payload.output_text)) {
      return payload.output_text;
    }

    for (const item of payload.output ?? []) {
      if (item.type !== 'message') {
        continue;
      }

      for (const content of item.content ?? []) {
        if (content.type === 'output_text' && isNonEmptyString(content.text)) {
          return content.text;
        }
      }
    }

    return null;
  }

  // Defensive clamp/coercion in case the model output doesn't perfectly match
  // the requested schema — Structured Outputs makes this unlikely but not
  // impossible, and a malformed value here should never crash the job.
  private normalizeQualificationResult(
    value: Partial<WhatsappAgentQualificationResult>,
  ): WhatsappAgentQualificationResult {
    return {
      reply: isNonEmptyString(value.reply)
        ? value.reply
        : 'Desculpe, não consegui processar sua mensagem agora. Um de nossos atendentes vai te responder em breve.',
      score: Math.max(0, Math.min(100, Number(value.score ?? 0))),
      stage: isNonEmptyString(value.stage) ? value.stage : 'qualifying',
      summary: isNonEmptyString(value.summary) ? value.summary : '',
      isQualified: Boolean(value.isQualified),
      wantsHumanHandoff: Boolean(value.wantsHumanHandoff),
    };
  }
}
