import { type FunnelPage } from '@/funnel/types/FunnelPage';
import { FUNNEL_API_URL, FUNNEL_WORKSPACE_ID } from '@/funnel/config';

export type FunnelPageResponse = Pick<
  FunnelPage,
  'id' | 'type' | 'content' | 'seoTitle' | 'seoDescription'
>;

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

  // Trusted boundary: our own backend's public funnel endpoint, not
  // third-party input.
  // eslint-disable-next-line no-unsafe-type-assertion
  return body as FunnelPageResponse;
};
