export enum VoiceCallDirection {
  INBOUND = 'INBOUND',
  OUTBOUND = 'OUTBOUND',
}

export enum VoiceCallStatus {
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  NO_ANSWER = 'NO_ANSWER',
}

export type VoiceCall = {
  id: string;
  voiceAgentId: string;
  twilioCallSid: string;
  direction: VoiceCallDirection;
  status: VoiceCallStatus;
  fromNumber: string;
  toNumber: string;
  startedAt: string | null;
  endedAt: string | null;
  durationSeconds: number | null;
  transcript: string | null;
  summary: string | null;
  createdAt: string;
  __typename: 'VoiceCallDTO';
};
