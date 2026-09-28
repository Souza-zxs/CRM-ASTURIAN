import { type FunnelConfirmationPageContent } from '@/funnel/types/FunnelPage';

export type ConfirmationStatusTone = 'declined' | 'success';

// The only variant that isn't a success (a declined payment) gets a visibly
// different badge — everything else about the page (message, CTA) is
// already free text the admin fills in per instance.
export const getConfirmationStatusTone = (
  variant: FunnelConfirmationPageContent['variant'],
): ConfirmationStatusTone =>
  variant === 'pagamento_recusado' ? 'declined' : 'success';
