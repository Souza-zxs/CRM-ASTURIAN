export type WhatsappAgent = {
  id: string;
  name: string;
  whatsappChannelId: string;
  isActive: boolean;
  systemPrompt: string;
  greetingMessage: string | null;
  forbiddenPhrases: string[] | null;
  qualificationCriteria: string | null;
  handoffInstructions: string | null;
  model: string;
  createdAt: string;
  updatedAt: string;
  __typename: 'WhatsappAgentDTO';
};
