import { FUNNEL_API_URL, FUNNEL_WORKSPACE_ID } from '@/funnel/config';

// Returns null when the lead can't be resolved (unknown id, rate limited,
// network error): the workshop page then falls back to showing the video
// instead of leaving the visitor stuck behind a countdown that never ends.
export const fetchFunnelLeadSignupTime = async (
  leadId: string,
): Promise<Date | null> => {
  try {
    const response = await fetch(
      `${FUNNEL_API_URL}/funnel/${FUNNEL_WORKSPACE_ID}/leads/${encodeURIComponent(leadId)}`,
    );

    if (!response.ok) {
      return null;
    }

    const body: unknown = await response.json();

    if (
      typeof body !== 'object' ||
      body === null ||
      !('signedUpAt' in body) ||
      typeof body.signedUpAt !== 'string'
    ) {
      return null;
    }

    const signedUpAt = new Date(body.signedUpAt);

    return Number.isNaN(signedUpAt.getTime()) ? null : signedUpAt;
  } catch {
    return null;
  }
};
