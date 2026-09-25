const BRAZIL_CALLING_CODE = '55';
// DDD (2) + number (8 or 9): a national Brazilian number without country code.
const BRAZILIAN_NATIONAL_NUMBER_LENGTHS = [10, 11];

// The Graph API wants digits only, country code included. Person.phones keeps
// the calling code in a separate field, so a variable like
// {{trigger.phones.primaryPhoneNumber}} arrives without it: national Brazilian
// numbers get 55 prepended, anything longer is assumed to already carry one.
export const normalizeWhatsappRecipient = (rawRecipient: string): string => {
  const digits = rawRecipient.replace(/\D/g, '');

  return BRAZILIAN_NATIONAL_NUMBER_LENGTHS.includes(digits.length)
    ? `${BRAZIL_CALLING_CODE}${digits}`
    : digits;
};
