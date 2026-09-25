export type FunnelLeadPhone = {
  primaryPhoneNumber: string;
  primaryPhoneCallingCode?: string;
  primaryPhoneCountryCode?: string;
};

const BRAZIL_CALLING_CODE = '+55';
const BRAZIL_COUNTRY_CODE = 'BR';
// 55 + DDD (2) + number (8 or 9): shorter strings can't carry a country code.
const MIN_DIGITS_WITH_BRAZIL_COUNTRY_CODE = 12;

// The public form takes a free-text WhatsApp number ("(83) 99999-9999",
// "+55 83 99999-9999"). Person.phones wants digits split from the calling
// code, so normalize here. Numbers are assumed Brazilian unless the lead
// typed an explicit "+" with another country code, which is kept as digits
// only rather than guessing a calling code.
export const parseFunnelLeadPhone = (
  rawPhone: string,
): FunnelLeadPhone | null => {
  const digits = rawPhone.replace(/\D/g, '');

  if (digits.length === 0) {
    return null;
  }

  const hasBrazilCountryCode =
    digits.startsWith('55') &&
    digits.length >= MIN_DIGITS_WITH_BRAZIL_COUNTRY_CODE;
  const hasForeignCountryCode =
    rawPhone.trim().startsWith('+') && !digits.startsWith('55');

  if (hasForeignCountryCode) {
    return { primaryPhoneNumber: digits };
  }

  return {
    primaryPhoneNumber: hasBrazilCountryCode ? digits.slice(2) : digits,
    primaryPhoneCallingCode: BRAZIL_CALLING_CODE,
    primaryPhoneCountryCode: BRAZIL_COUNTRY_CODE,
  };
};
