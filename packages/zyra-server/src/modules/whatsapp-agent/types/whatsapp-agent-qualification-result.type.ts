// Structured-output shape requested from the OpenAI Responses API for every
// WhatsApp agent reply — the reply text plus a lightweight lead
// qualification, mirroring crm-imobiliario's lead-agent.ts LeadQualification
// (trimmed down to the fields WhatsappAgentResponderService actually acts on).
export type WhatsappAgentQualificationResult = {
  reply: string;
  score: number;
  stage: string;
  summary: string;
  isQualified: boolean;
  wantsHumanHandoff: boolean;
};

// Raw shape of an OpenAI Responses API (`/v1/responses`) payload — only the
// fields this module reads. Not the full API surface.
export type OpenAiResponsesPayload = {
  output_text?: string;
  output?: Array<{
    type: string;
    content?: Array<{ type: string; text?: string }>;
  }>;
  error?: { message?: string };
};
