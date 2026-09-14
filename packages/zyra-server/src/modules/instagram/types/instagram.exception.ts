import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { assertUnreachable } from 'zyra-shared/utils';

import { CustomException } from 'src/utils/custom-exception';

export enum InstagramExceptionCode {
  INSTAGRAM_CHANNEL_NOT_FOUND = 'INSTAGRAM_CHANNEL_NOT_FOUND',
  INSTAGRAM_NOT_CONFIGURED = 'INSTAGRAM_NOT_CONFIGURED',
  INSTAGRAM_LOGIN_FAILED = 'INSTAGRAM_LOGIN_FAILED',
  INSTAGRAM_SEND_FAILED = 'INSTAGRAM_SEND_FAILED',
  INSTAGRAM_INVALID_WEBHOOK_SIGNATURE = 'INSTAGRAM_INVALID_WEBHOOK_SIGNATURE',
  INSTAGRAM_AUTOMATION_RULE_NOT_FOUND = 'INSTAGRAM_AUTOMATION_RULE_NOT_FOUND',
  INSTAGRAM_ACCOUNT_ALREADY_CONNECTED_ELSEWHERE = 'INSTAGRAM_ACCOUNT_ALREADY_CONNECTED_ELSEWHERE',
  INSTAGRAM_AUTOMATION_RULE_MEDIA_REQUIRED = 'INSTAGRAM_AUTOMATION_RULE_MEDIA_REQUIRED',
  INSTAGRAM_AUTOMATION_RULE_CSV_INVALID = 'INSTAGRAM_AUTOMATION_RULE_CSV_INVALID',
}

const getInstagramExceptionUserFriendlyMessage = (
  code: InstagramExceptionCode,
) => {
  switch (code) {
    case InstagramExceptionCode.INSTAGRAM_CHANNEL_NOT_FOUND:
      return msg`Instagram channel not found.`;
    case InstagramExceptionCode.INSTAGRAM_NOT_CONFIGURED:
      return msg`Instagram is not configured on this server.`;
    case InstagramExceptionCode.INSTAGRAM_LOGIN_FAILED:
      return msg`Could not connect your Instagram account. Please try again.`;
    case InstagramExceptionCode.INSTAGRAM_SEND_FAILED:
      return msg`Could not send the Instagram direct message.`;
    case InstagramExceptionCode.INSTAGRAM_INVALID_WEBHOOK_SIGNATURE:
      return msg`Invalid Instagram webhook signature.`;
    case InstagramExceptionCode.INSTAGRAM_AUTOMATION_RULE_NOT_FOUND:
      return msg`Automation rule not found.`;
    case InstagramExceptionCode.INSTAGRAM_ACCOUNT_ALREADY_CONNECTED_ELSEWHERE:
      return msg`This Instagram account is already connected to another workspace.`;
    case InstagramExceptionCode.INSTAGRAM_AUTOMATION_RULE_MEDIA_REQUIRED:
      return msg`Choose a post, or enable "attach to next Reel" instead.`;
    case InstagramExceptionCode.INSTAGRAM_AUTOMATION_RULE_CSV_INVALID:
      return msg`The CSV file could not be read. Check its format and try again.`;
    default:
      assertUnreachable(code);
  }
};

export class InstagramException extends CustomException<InstagramExceptionCode> {
  constructor(
    message: string,
    code: InstagramExceptionCode,
    { userFriendlyMessage }: { userFriendlyMessage?: MessageDescriptor } = {},
  ) {
    super(message, code, {
      userFriendlyMessage:
        userFriendlyMessage ?? getInstagramExceptionUserFriendlyMessage(code),
    });
  }
}
