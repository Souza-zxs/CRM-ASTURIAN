// The conversation's data vocabulary and authored timing grammar.
export type ConversationMessage =
  | { id: string; role: 'user'; text: string }
  | { id: string; role: 'assistant' };

export type TerminalView = 'ai-chat' | 'editor';

const CHAT_TIMINGS = {
  thinkingMs: 700,
  textStreamCharMs: 14,
  bubbleEnterMs: 280,
  fileCardEnterMs: 320,
};

const INITIAL_PROMPT_TEXT =
  'Monte um CRM de operações de lançamento no meu workspace com foguetes, lançamentos, cargas, clientes e locais de lançamento, com ações relevantes pra cada um.';

export const CONVERSATION_CORE = {
  timings: CHAT_TIMINGS,
  initialPromptText: INITIAL_PROMPT_TEXT,
};
