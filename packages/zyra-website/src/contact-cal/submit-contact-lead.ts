import {
  CONTACT_LEAD_API_URL,
  CONTACT_LEAD_PAGE_SLUG,
  CONTACT_LEAD_UTM_SOURCE,
  CONTACT_LEAD_WORKSPACE_ID,
} from './contact-lead-config';

export type ContactLeadInput = {
  email: string;
  name: string;
  whatsapp: string;
};

export type ContactLeadResult =
  | { status: 'sent' }
  | { status: 'unavailable' }
  | { status: 'invalid'; message: string };

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const normalizeContactLead = (input: ContactLeadInput) => ({
  email: input.email.trim().toLowerCase(),
  name: input.name.trim(),
  whatsapp: input.whatsapp.trim(),
});

export const isContactLeadValid = (input: ContactLeadInput): boolean => {
  const { email, name, whatsapp } = normalizeContactLead(input);

  return (
    name.length > 0 &&
    EMAIL_PATTERN.test(email) &&
    whatsapp.replace(/\D/g, '').length >= 8
  );
};

// The lead lands in the CRM through the same public funnel endpoints the
// funnel pages use: the published "contact" page is looked up by slug (its
// public payload carries the id the lead endpoint requires), then the lead is
// posted against it and becomes a person plus an opportunity server-side.
export const submitContactLead = async (
  input: ContactLeadInput,
  fetchImplementation: typeof fetch = fetch,
): Promise<ContactLeadResult> => {
  if (!isContactLeadValid(input)) {
    return { status: 'invalid', message: 'invalid-input' };
  }

  const baseUrl = `${CONTACT_LEAD_API_URL}/funnel/${CONTACT_LEAD_WORKSPACE_ID}`;

  try {
    const pageResponse = await fetchImplementation(
      `${baseUrl}/${encodeURIComponent(CONTACT_LEAD_PAGE_SLUG)}`,
    );

    if (!pageResponse.ok) {
      return { status: 'unavailable' };
    }

    const page: unknown = await pageResponse.json();
    const funnelPageId =
      typeof page === 'object' && page !== null && 'id' in page
        ? String((page as { id: unknown }).id)
        : '';

    if (funnelPageId === '') {
      return { status: 'unavailable' };
    }

    const leadResponse = await fetchImplementation(`${baseUrl}/leads`, {
      body: JSON.stringify({
        ...normalizeContactLead(input),
        funnelPageId,
        utmSource: CONTACT_LEAD_UTM_SOURCE,
      }),
      headers: { 'Content-Type': 'application/json' },
      method: 'POST',
    });

    return leadResponse.ok ? { status: 'sent' } : { status: 'unavailable' };
  } catch {
    return { status: 'unavailable' };
  }
};
