import { FUNNEL_API_URL, FUNNEL_WORKSPACE_ID } from '@/config';
import { type FunnelPageResponse } from '@/types/FunnelPageContent';

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

  return response.json() as Promise<FunnelPageResponse>;
};
