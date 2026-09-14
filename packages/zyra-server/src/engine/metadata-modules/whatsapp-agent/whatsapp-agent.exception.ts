import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';

import { assertUnreachable } from 'zyra-shared/utils';

import { CustomException } from 'src/utils/custom-exception';

export enum WhatsappAgentExceptionCode {
  WHATSAPP_AGENT_NOT_FOUND = 'WHATSAPP_AGENT_NOT_FOUND',
  WHATSAPP_CHANNEL_NOT_FOUND = 'WHATSAPP_CHANNEL_NOT_FOUND',
  WHATSAPP_AGENT_ALREADY_EXISTS_FOR_CHANNEL = 'WHATSAPP_AGENT_ALREADY_EXISTS_FOR_CHANNEL',
  WHATSAPP_AGENT_CONVERSATION_NOT_FOUND = 'WHATSAPP_AGENT_CONVERSATION_NOT_FOUND',
}

const getWhatsappAgentExceptionUserFriendlyMessage = (
  code: WhatsappAgentExceptionCode,
) => {
  switch (code) {
    case WhatsappAgentExceptionCode.WHATSAPP_AGENT_NOT_FOUND:
      return msg`Whatsapp agent not found.`;
    case WhatsappAgentExceptionCode.WHATSAPP_CHANNEL_NOT_FOUND:
      return msg`Whatsapp channel not found.`;
    case WhatsappAgentExceptionCode.WHATSAPP_AGENT_ALREADY_EXISTS_FOR_CHANNEL:
      return msg`This Whatsapp channel already has an agent configured.`;
    case WhatsappAgentExceptionCode.WHATSAPP_AGENT_CONVERSATION_NOT_FOUND:
      return msg`Whatsapp agent conversation not found.`;
    default:
      assertUnreachable(code);
  }
};

export class WhatsappAgentException extends CustomException<WhatsappAgentExceptionCode> {
  constructor(
    message: string,
    code: WhatsappAgentExceptionCode,
    { userFriendlyMessage }: { userFriendlyMessage?: MessageDescriptor } = {},
  ) {
    super(message, code, {
      userFriendlyMessage:
        userFriendlyMessage ??
        getWhatsappAgentExceptionUserFriendlyMessage(code),
    });
  }
}
