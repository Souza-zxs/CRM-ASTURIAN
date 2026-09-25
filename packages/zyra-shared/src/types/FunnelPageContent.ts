import { type FunnelPageType } from './FunnelPageType';

export type FunnelSignupPageContent = {
  type: FunnelPageType.SIGNUP;
  headline: string;
  subheadline: string;
  bullets: string[];
  ctaLabel: string;
  formSuccessRedirectSlug: string;
};

// Turns the workshop into a scheduled event: each lead is placed in the next
// daily session after signing up. Without it the video plays right away.
export type FunnelWorkshopSchedule = {
  // "HH:mm" in the schedule's own time zone, e.g. ["12:00", "20:00"].
  timesOfDay: string[];
  // Offset from UTC in minutes (Brasília is -180; no daylight saving).
  utcOffsetMinutes: number;
  // A signup closer than this to a session slips to the following one.
  minLeadMinutes: number;
};

export type FunnelWorkshopPageContent = {
  type: FunnelPageType.WORKSHOP;
  videoUrl: string;
  chatEnabled: boolean;
  ctaLabel: string;
  ctaRedirectSlug: string;
  schedule?: FunnelWorkshopSchedule;
};

export type FunnelValueStackItem = {
  name: string;
  description: string;
  perceivedValue: string;
};

export type FunnelFaqItem = {
  question: string;
  answer: string;
};

export type FunnelSalesPageContent = {
  type: FunnelPageType.SALES;
  headline: string;
  valueStack: FunnelValueStackItem[];
  price: string;
  guaranteeText: string;
  faq: FunnelFaqItem[];
  ctaLabel: string;
  checkoutUrl: string;
};

export type FunnelConfirmationVariant =
  | 'inscricao'
  | 'compra'
  | 'pagamento_recusado';

export type FunnelConfirmationPageContent = {
  type: FunnelPageType.CONFIRMATION;
  variant: FunnelConfirmationVariant;
  message: string;
  nextStepLabel: string;
  nextStepUrl: string;
};

export type FunnelPageContent =
  | FunnelSignupPageContent
  | FunnelWorkshopPageContent
  | FunnelSalesPageContent
  | FunnelConfirmationPageContent;
