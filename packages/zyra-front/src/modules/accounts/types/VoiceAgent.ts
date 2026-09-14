export type VoiceAgent = {
  id: string;
  name: string;
  isActive: boolean;
  phoneNumber: string | null;
  voice: string;
  systemPrompt: string;
  greetingMessage: string | null;
  forbiddenPhrases: string[] | null;
  qualificationCriteria: string | null;
  handoffInstructions: string | null;
  transferPhoneNumber: string | null;
  createdAt: string;
  updatedAt: string;
  __typename: 'VoiceAgentDTO';
};
