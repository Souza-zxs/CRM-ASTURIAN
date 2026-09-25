import { FUNNEL_API_URL, FUNNEL_WORKSPACE_ID } from '@/funnel/config';

// Fire-and-forget: the visitor is already watching the workshop, so a failed
// tracking call must never surface as an error on the page.
export const markFunnelLeadAttended = async (leadId: string): Promise<void> => {
  await fetch(
    `${FUNNEL_API_URL}/funnel/${FUNNEL_WORKSPACE_ID}/leads/${encodeURIComponent(leadId)}/attended`,
    { method: 'POST' },
  ).catch(() => undefined);
};
