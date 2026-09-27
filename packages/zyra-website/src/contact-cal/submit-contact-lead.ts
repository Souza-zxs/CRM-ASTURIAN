import { CONTACT_LEAD_CONFIG } from './contact-lead-config';
import { type ContactLeadInput } from './contact-lead-input';
import { isContactLeadValid } from './is-contact-lead-valid';
import { normalizeContactLead } from './normalize-contact-lead';

export type ContactLeadResult =
  | { status: 'sent' }
  | { status: 'unavailable' }
  | { status: 'invalid'; message: string };

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

  const baseUrl = `${CONTACT_LEAD_CONFIG.apiUrl}/funnel/${CONTACT_LEAD_CONFIG.workspaceId}`;

  try {
    const pageResponse = await fetchImplementation(
      `${baseUrl}/${encodeURIComponent(CONTACT_LEAD_CONFIG.pageSlug)}`,
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
        utmSource: CONTACT_LEAD_CONFIG.utmSource,
      }),
      headers: { 'Content-Type': 'application/json' },
      method: 'POST',
    });

    return leadResponse.ok ? { status: 'sent' } : { status: 'unavailable' };
  } catch {
    return { status: 'unavailable' };
  }
};
