import { type ContactLeadInput } from './contact-lead-input';

export const normalizeContactLead = (input: ContactLeadInput) => ({
  email: input.email.trim().toLowerCase(),
  name: input.name.trim(),
  whatsapp: input.whatsapp.trim(),
});
