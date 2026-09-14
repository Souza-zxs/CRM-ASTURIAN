// Twilio Media Streams protocol — messages exchanged over the raw WebSocket
// opened by Twilio after a <Connect><Stream> TwiML verb.
// https://www.twilio.com/docs/voice/media-streams/websocket-messages
//
// Twilio → us.
export type TwilioMediaStreamInboundEvent =
  | { event: 'connected'; protocol: string; version: string }
  | {
      event: 'start';
      streamSid: string;
      start: {
        streamSid: string;
        callSid: string;
        tracks: string[];
        mediaFormat: { encoding: string; sampleRate: number; channels: number };
      };
    }
  | {
      event: 'media';
      streamSid: string;
      media: {
        track: string;
        chunk: string;
        timestamp: string;
        payload: string;
      };
    }
  | { event: 'stop'; streamSid: string; stop: { callSid: string } }
  | { event: 'mark'; streamSid: string; mark: { name: string } };

// Us → Twilio: play back audio (base64 g711 mu-law, matching the inbound
// format) on the same stream.
export type TwilioMediaStreamOutboundMediaEvent = {
  event: 'media';
  streamSid: string;
  media: { payload: string };
};

// Us → Twilio: end the call entirely (used by the end_call tool handler).
export type TwilioMediaStreamOutboundStopEvent = {
  event: 'clear';
  streamSid: string;
};
