import { Injectable } from '@nestjs/common';

import { isNonEmptyString } from '@sniptt/guards';
import { isNonEmptyArray } from 'zyra-shared/utils';

import { type WhatsappAgentEntity } from 'src/engine/metadata-modules/whatsapp-agent/entities/whatsapp-agent.entity';

// Fixed rules applied to every WhatsApp agent, regardless of workspace
// configuration — same idea as VoiceAgentInstructionsBuilderService's
// PHONE_CALL_BEHAVIOR_RULES, adapted for text chat instead of a live call.
const WHATSAPP_CHAT_BEHAVIOR_RULES = `Regras de comportamento para esta conversa de WhatsApp:
- Escreva de forma natural e humana, nunca como um robô ou um script decorado.
- Faça UMA pergunta por vez. Nunca empilhe várias perguntas na mesma mensagem.
- Use mensagens curtas — como alguém digitando no WhatsApp, não um e-mail formal.
- Não repita literalmente o que a pessoa acabou de dizer, apenas confirme o essencial.
- Evite jargão técnico e nomes de sistemas internos.
- Se a pessoa mandar só uma saudação curta (oi, olá, bom dia), responda de forma breve e não emende perguntas de qualificação na mesma mensagem.`;

// Builds the final system prompt sent to OpenAI for a given reply. Centralized
// here so the prompt is assembled identically regardless of caller — mirrors
// VoiceAgentInstructionsBuilderService's role for the voice agent.
@Injectable()
export class WhatsappAgentInstructionsBuilderService {
  buildInstructions(whatsappAgent: WhatsappAgentEntity): string {
    const sections: string[] = [whatsappAgent.systemPrompt.trim()];

    if (isNonEmptyString(whatsappAgent.greetingMessage)) {
      sections.push(
        `Mensagem de saudação preferida ao iniciar a conversa: "${whatsappAgent.greetingMessage.trim()}"`,
      );
    }

    if (isNonEmptyArray(whatsappAgent.forbiddenPhrases)) {
      sections.push(
        `Nunca diga nenhuma das seguintes frases ou palavras: ${whatsappAgent.forbiddenPhrases.join(', ')}.`,
      );
    }

    if (isNonEmptyString(whatsappAgent.qualificationCriteria)) {
      sections.push(
        `Critérios para considerar este lead qualificado: ${whatsappAgent.qualificationCriteria.trim()}`,
      );
    }

    if (isNonEmptyString(whatsappAgent.handoffInstructions)) {
      sections.push(
        `Instruções para transferir a conversa para um humano: ${whatsappAgent.handoffInstructions.trim()}`,
      );
    }

    sections.push(WHATSAPP_CHAT_BEHAVIOR_RULES);

    return sections.join('\n\n');
  }
}
