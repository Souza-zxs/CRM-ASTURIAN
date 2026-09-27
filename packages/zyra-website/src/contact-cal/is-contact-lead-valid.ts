import { type ContactLeadInput } from './contact-lead-input';
import { normalizeContactLead } from './normalize-contact-lead';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const isContactLeadValid = (input: ContactLeadInput): boolean => {
  const { email, name, whatsapp } = normalizeContactLead(input);

  return (
    name.length > 0 &&
    EMAIL_PATTERN.test(email) &&
    whatsapp.replace(/\D/g, '').length >= 8
  );
};
