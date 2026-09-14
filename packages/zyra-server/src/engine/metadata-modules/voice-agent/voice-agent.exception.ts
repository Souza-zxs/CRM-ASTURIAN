import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { assertUnreachable } from 'zyra-shared/utils';

import { CustomException } from 'src/utils/custom-exception';

export enum VoiceAgentExceptionCode {
  VOICE_AGENT_NOT_FOUND = 'VOICE_AGENT_NOT_FOUND',
  VOICE_AGENT_PHONE_NUMBER_ALREADY_IN_USE = 'VOICE_AGENT_PHONE_NUMBER_ALREADY_IN_USE',
}

const getVoiceAgentExceptionUserFriendlyMessage = (
  code: VoiceAgentExceptionCode,
) => {
  switch (code) {
    case VoiceAgentExceptionCode.VOICE_AGENT_NOT_FOUND:
      return msg`Voice agent not found.`;
    case VoiceAgentExceptionCode.VOICE_AGENT_PHONE_NUMBER_ALREADY_IN_USE:
      return msg`This phone number is already assigned to another voice agent.`;
    default:
      assertUnreachable(code);
  }
};

export class VoiceAgentException extends CustomException<VoiceAgentExceptionCode> {
  constructor(
    message: string,
    code: VoiceAgentExceptionCode,
    { userFriendlyMessage }: { userFriendlyMessage?: MessageDescriptor } = {},
  ) {
    super(message, code, {
      userFriendlyMessage:
        userFriendlyMessage ?? getVoiceAgentExceptionUserFriendlyMessage(code),
    });
  }
}
