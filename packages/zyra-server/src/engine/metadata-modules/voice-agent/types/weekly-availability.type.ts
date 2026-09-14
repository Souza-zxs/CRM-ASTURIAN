export type VoiceAgentAvailabilityWindow = {
  start: string;
  end: string;
};

// Free-form weekly schedule keyed by weekday (e.g. "segunda", "terca" — the
// front-end decides the exact key set). Consumed by the availability tool
// described to the OpenAI Realtime API session, not validated server-side
// beyond being valid JSON — the agent reasons over whatever the workspace
// configured, same spirit as forbiddenPhrases being a free string list.
export type VoiceAgentWeeklyAvailability = Record<
  string,
  VoiceAgentAvailabilityWindow[]
>;
