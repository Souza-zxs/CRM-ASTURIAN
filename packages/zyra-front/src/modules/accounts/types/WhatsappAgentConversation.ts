export type WhatsappAgentConversation = {
  id: string;
  whatsappAgentId: string;
  contactPhoneNumber: string;
  isAiEnabled: boolean;
  qualificationSummary: string | null;
  lastMessageAt: string | null;
  createdAt: string;
  __typename: 'WhatsappAgentConversationDTO';
};
