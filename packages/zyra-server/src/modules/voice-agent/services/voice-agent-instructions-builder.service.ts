import { Injectable } from '@nestjs/common';

import { isNonEmptyString } from '@sniptt/guards';

import { type VoiceAgentEntity } from 'src/engine/metadata-modules/voice-agent/entities/voice-agent.entity';

// Fixed rules applied to every voice agent, regardless of workspace
// configuration — what makes a Realtime API voice actually sound like a
// phone agent instead of a chatbot reading text aloud.
const PHONE_CALL_BEHAVIOR_RULES = `Regras de comportamento para esta ligação telefônica:
- Fale de forma natural e humana, nunca como um robô lendo um roteiro.
- Faça UMA pergunta por vez. Nunca empilhe várias perguntas na mesma fala.
- Confirme brevemente que entendeu o que a pessoa disse antes de mudar de assunto.
- Use frases curtas — em uma ligação, frases longas são difíceis de acompanhar.
- Se não entender algo, peça para repetir de forma natural, sem soar confuso.
- Não repita literalmente o que a pessoa acabou de dizer, apenas confirme o essencial.
- Evite jargão técnico e nomes de sistemas internos.
- Se a ligação ficar em silêncio, retome a conversa com naturalidade em vez de repetir a mesma frase.`;

// Builds the final system prompt sent to the OpenAI Realtime API session for
// a given call. Centralized here so the prompt is assembled identically
// regardless of caller (the media-stream bridge today; any future outbound-
// call flow tomorrow) — never duplicate this concatenation elsewhere.
@Injectable()
export class VoiceAgentInstructionsBuilderService {
  buildInstructions(voiceAgent: VoiceAgentEntity): string {
    const sections: string[] = [voiceAgent.systemPrompt.trim()];

    if (isNonEmptyString(voiceAgent.greetingMessage)) {
      sections.push(
        `Mensagem de saudação ao atender a ligação: "${voiceAgent.greetingMessage.trim()}"`,
      );
    }

    if (voiceAgent.forbiddenPhrases && voiceAgent.forbiddenPhrases.length > 0) {
      sections.push(
        `Nunca diga nenhuma das seguintes frases ou palavras: ${voiceAgent.forbiddenPhrases.join(', ')}.`,
      );
    }

    if (isNonEmptyString(voiceAgent.qualificationCriteria)) {
      sections.push(
        `Critérios para considerar este lead qualificado: ${voiceAgent.qualificationCriteria.trim()}`,
      );
    }

    if (isNonEmptyString(voiceAgent.handoffInstructions)) {
      sections.push(
        `Instruções para transferir a ligação para um humano: ${voiceAgent.handoffInstructions.trim()}`,
      );
    }

    sections.push(PHONE_CALL_BEHAVIOR_RULES);

    return sections.join('\n\n');
  }
}
