// Direction of a message inside a WhatsappAgentConversationEntity's own short
// history (kept separate from the CRM inbox's MessageDirection enum since
// this history exists purely to feed context back into the OpenAI prompt).
export enum WhatsappAgentMessageDirection {
  INBOUND = 'INBOUND',
  OUTBOUND = 'OUTBOUND',
}
