import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { assertUnreachable } from 'zyra-shared/utils';

import { CustomException } from 'src/utils/custom-exception';

export enum WhatsappExceptionCode {
  WHATSAPP_CHANNEL_NOT_FOUND = 'WHATSAPP_CHANNEL_NOT_FOUND',
  WHATSAPP_NOT_CONFIGURED = 'WHATSAPP_NOT_CONFIGURED',
  WHATSAPP_EMBEDDED_SIGNUP_FAILED = 'WHATSAPP_EMBEDDED_SIGNUP_FAILED',
  WHATSAPP_SEND_FAILED = 'WHATSAPP_SEND_FAILED',
  WHATSAPP_INVALID_WEBHOOK_SIGNATURE = 'WHATSAPP_INVALID_WEBHOOK_SIGNATURE',
  WHATSAPP_NUMBER_ALREADY_CONNECTED_ELSEWHERE = 'WHATSAPP_NUMBER_ALREADY_CONNECTED_ELSEWHERE',
}

const getWhatsappExceptionUserFriendlyMessage = (
  code: WhatsappExceptionCode,
) => {
  switch (code) {
    case WhatsappExceptionCode.WHATSAPP_CHANNEL_NOT_FOUND:
      return msg`WhatsApp channel not found.`;
    case WhatsappExceptionCode.WHATSAPP_NOT_CONFIGURED:
      return msg`WhatsApp is not configured on this server.`;
    case WhatsappExceptionCode.WHATSAPP_EMBEDDED_SIGNUP_FAILED:
      return msg`Could not connect your WhatsApp Business number. Please try again.`;
    case WhatsappExceptionCode.WHATSAPP_SEND_FAILED:
      return msg`Could not send the WhatsApp message.`;
    case WhatsappExceptionCode.WHATSAPP_INVALID_WEBHOOK_SIGNATURE:
      return msg`Invalid WhatsApp webhook signature.`;
    case WhatsappExceptionCode.WHATSAPP_NUMBER_ALREADY_CONNECTED_ELSEWHERE:
      return msg`This WhatsApp number is already connected to another workspace.`;
    default:
      assertUnreachable(code);
  }
};

export class WhatsappException extends CustomException<WhatsappExceptionCode> {
  constructor(
    message: string,
    code: WhatsappExceptionCode,
    { userFriendlyMessage }: { userFriendlyMessage?: MessageDescriptor } = {},
  ) {
    super(message, code, {
      userFriendlyMessage:
        userFriendlyMessage ?? getWhatsappExceptionUserFriendlyMessage(code),
    });
  }
}
