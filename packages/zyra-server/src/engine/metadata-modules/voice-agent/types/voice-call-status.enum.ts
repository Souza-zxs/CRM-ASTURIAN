// Lifecycle status of a phone call handled by a VoiceAgentEntity. Set to
// IN_PROGRESS when the inbound Twilio webhook creates the row, then moved to
// a terminal state either by Twilio's status callback (see
// voice-webhooks.controller.ts) or by the media-stream bridge closing the
// call itself.
export enum VoiceCallStatus {
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  NO_ANSWER = 'NO_ANSWER',
}
