// Subset of the application/x-www-form-urlencoded fields Twilio posts to the
// "voice URL" / "status callback URL" configured on a phone number. Twilio
// sends many more fields (CallerCity, CallerCountry, etc.) — only the ones
// this module actually reads are typed here.
// https://www.twilio.com/docs/voice/twiml#request-parameters
export type TwilioIncomingCallWebhookBody = {
  CallSid: string;
  From: string;
  To: string;
  CallStatus?: string;
};

// https://www.twilio.com/docs/voice/twiml#call-status-changes
export type TwilioCallStatus =
  | 'queued'
  | 'ringing'
  | 'in-progress'
  | 'completed'
  | 'busy'
  | 'failed'
  | 'no-answer'
  | 'canceled';

export type TwilioStatusCallbackWebhookBody = {
  CallSid: string;
  CallStatus: TwilioCallStatus;
  CallDuration?: string;
  RecordingUrl?: string;
};
