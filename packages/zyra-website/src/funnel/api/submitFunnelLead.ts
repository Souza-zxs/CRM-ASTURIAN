import { FUNNEL_API_URL, FUNNEL_WORKSPACE_ID } from '@/funnel/config';

export type SubmitFunnelLeadInput = {
  funnelPageId: string;
  name: string;
  email: string;
  whatsapp: string;
};

const getUtmParams = () => {
  const params = new URLSearchParams(window.location.search);

  return {
    utmSource: params.get('utm_source') ?? undefined,
    utmMedium: params.get('utm_medium') ?? undefined,
    utmCampaign: params.get('utm_campaign') ?? undefined,
  };
};

export const submitFunnelLead = async (
  input: SubmitFunnelLeadInput,
): Promise<void> => {
  const response = await fetch(
    `${FUNNEL_API_URL}/funnel/${FUNNEL_WORKSPACE_ID}/leads`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...input, ...getUtmParams() }),
    },
  );

  if (!response.ok) {
    const body: unknown = await response.json().catch(() => null);
    const message =
      typeof body === 'object' && body !== null && 'message' in body
        ? String((body as { message: unknown }).message)
        : undefined;

    throw new Error(message ?? `Failed to submit (${response.status})`);
  }
};
