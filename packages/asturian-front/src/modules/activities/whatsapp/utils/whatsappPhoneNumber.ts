import { MessageParticipantRole } from 'zyra-shared/types';
import { isDefined } from 'zyra-shared/utils';

import { type WhatsappThreadMessage } from '@/activities/whatsapp/types/WhatsappThreadMessage';

// Mesma normalizacao do backend (so digitos) pra comparar telefones
export const normalizeWhatsappPhoneNumber = (
  phoneNumber: string | null | undefined,
): string => (phoneNumber ?? '').replace(/\D/g, '');

export const isWhatsappMessageOutgoing = (
  message: WhatsappThreadMessage,
  ownPhoneNumbers: string[],
): boolean => {
  const normalizedOwnPhoneNumbers = ownPhoneNumbers.map(
    normalizeWhatsappPhoneNumber,
  );

  return (message.messageParticipants ?? []).some(
    (participant) =>
      participant.role === MessageParticipantRole.FROM &&
      normalizedOwnPhoneNumbers.includes(
        normalizeWhatsappPhoneNumber(participant.handle),
      ),
  );
};

export const getWhatsappContactPhoneNumber = (
  messages: WhatsappThreadMessage[],
  ownPhoneNumbers: string[],
): string | null => {
  const normalizedOwnPhoneNumbers = ownPhoneNumbers.map(
    normalizeWhatsappPhoneNumber,
  );

  for (const message of messages) {
    const contactParticipant = (message.messageParticipants ?? []).find(
      (participant) =>
        isDefined(participant.handle) &&
        normalizeWhatsappPhoneNumber(participant.handle).length > 0 &&
        !normalizedOwnPhoneNumbers.includes(
          normalizeWhatsappPhoneNumber(participant.handle),
        ),
    );

    if (isDefined(contactParticipant?.handle)) {
      return normalizeWhatsappPhoneNumber(contactParticipant.handle);
    }
  }

  return null;
};
