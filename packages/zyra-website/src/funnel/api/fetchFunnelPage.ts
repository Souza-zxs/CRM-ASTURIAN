import { type FunnelPageContent } from 'zyra-shared/types';

import { FUNNEL_API_URL, FUNNEL_WORKSPACE_ID } from '@/funnel/config';

export type FunnelPageResponse = {
  id: string;
  type: FunnelPageContent['type'];
  content: FunnelPageContent;
  seoTitle: string | null;
  seoDescription: string | null;
};

export const fetchFunnelPage = async (
  slug: string,
): Promise<FunnelPageResponse | null> => {
  const response = await fetch(
    `${FUNNEL_API_URL}/funnel/${FUNNEL_WORKSPACE_ID}/${encodeURIComponent(slug)}`,
  );

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error(`Failed to load funnel page (status ${response.status})`);
  }

  const body: unknown = await response.json();

  // Trusted boundary: this is our own backend's funnel-page endpoint, not
  // third-party input — no runtime schema validation beyond the HTTP status
  // check above.
  // eslint-disable-next-line no-unsafe-type-assertion
  return body as FunnelPageResponse;
};
