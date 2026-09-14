// OpenAI Realtime API (WebSocket, speech-to-speech) event shapes.
// Based on the public "Realtime API over WebSocket" documentation for
// conversations using g711_ulaw audio — NOT verified against a live
// connection (no API key available in this environment). Event names in
// particular are the part most likely to drift between API revisions (e.g.
// "response.audio.delta" vs a future "response.output_audio.delta"); treat
// this file as the single place to update if OpenAI renames something.
// https://platform.openai.com/docs/guides/realtime

export const END_CALL_TOOL_NAME = 'end_call';

// Us → OpenAI, sent once right after the socket opens.
export type OpenAiRealtimeSessionUpdateEvent = {
  type: 'session.update';
  session: {
    instructions: string;
    voice: string;
    input_audio_format: 'g711_ulaw';
    output_audio_format: 'g711_ulaw';
    turn_detection: { type: 'server_vad' };
    tools: [
      {
        type: 'function';
        name: typeof END_CALL_TOOL_NAME;
        description: string;
        parameters: {
          type: 'object';
          properties: { reason: { type: 'string' } };
          required: ['reason'];
        };
      },
    ];
  };
};

// Us → OpenAI, one per inbound Twilio media chunk.
export type OpenAiRealtimeInputAudioBufferAppendEvent = {
  type: 'input_audio_buffer.append';
  audio: string;
};

// Us → OpenAI, acknowledges a tool call so the model can wrap up the turn.
export type OpenAiRealtimeFunctionCallOutputEvent = {
  type: 'conversation.item.create';
  item: {
    type: 'function_call_output';
    call_id: string;
    output: string;
  };
};

export type OpenAiRealtimeOutboundEvent =
  | OpenAiRealtimeSessionUpdateEvent
  | OpenAiRealtimeInputAudioBufferAppendEvent
  | OpenAiRealtimeFunctionCallOutputEvent
  | { type: 'response.create' };

// OpenAI → us. Only the event types this module actually handles are typed
// precisely; everything else falls through the `type: string` catch-all so
// unrecognized/future events don't break parsing.
export type OpenAiRealtimeAudioDeltaEvent = {
  type: 'response.audio.delta';
  delta: string; // base64 g711_ulaw chunk
};

export type OpenAiRealtimeAudioTranscriptDeltaEvent = {
  type: 'response.audio_transcript.delta';
  delta: string;
};

export type OpenAiRealtimeFunctionCallArgumentsDoneEvent = {
  type: 'response.function_call_arguments.done';
  call_id: string;
  name: string;
  arguments: string; // JSON-encoded arguments matching the tool's schema
};

export type OpenAiRealtimeErrorEvent = {
  type: 'error';
  error: { message: string; code?: string };
};

export type OpenAiRealtimeInboundEvent =
  | OpenAiRealtimeAudioDeltaEvent
  | OpenAiRealtimeAudioTranscriptDeltaEvent
  | OpenAiRealtimeFunctionCallArgumentsDoneEvent
  | OpenAiRealtimeErrorEvent
  | { type: string; [key: string]: unknown };
