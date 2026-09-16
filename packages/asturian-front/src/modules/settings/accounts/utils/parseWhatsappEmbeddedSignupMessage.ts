import { isPlainObject } from 'zyra-shared/utils';

// Meta only ever posts Embedded Signup messages from this origin — any other
// origin is untrusted and must be ignored.
const FACEBOOK_MESSAGE_ORIGIN = 'https://www.facebook.com';

export type WhatsappEmbeddedSignupData = {
  phoneNumberId: string;
  wabaId: string;
};

export const parseWhatsappEmbeddedSignupMessage = (
  event: MessageEvent,
): WhatsappEmbeddedSignupData | null => {
  if (event.origin !== FACEBOOK_MESSAGE_ORIGIN) {
    return null;
  }

  if (typeof event.data !== 'string') {
    return null;
  }

  let parsedData: unknown;

  try {
    parsedData = JSON.parse(event.data);
  } catch {
    return null;
  }

  if (
    !isPlainObject(parsedData) ||
    parsedData.type !== 'WA_EMBEDDED_SIGNUP' ||
    parsedData.event !== 'FINISH'
  ) {
    return null;
  }

  const signupData = parsedData.data;

  if (
    !isPlainObject(signupData) ||
    typeof signupData.phone_number_id !== 'string' ||
    typeof signupData.waba_id !== 'string'
  ) {
    return null;
  }

  return {
    phoneNumberId: signupData.phone_number_id,
    wabaId: signupData.waba_id,
  };
};
