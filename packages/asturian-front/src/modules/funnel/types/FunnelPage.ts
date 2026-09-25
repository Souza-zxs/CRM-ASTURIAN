export type FunnelPageType = 'SIGNUP' | 'WORKSHOP' | 'SALES' | 'CONFIRMATION';

export type FunnelPageStatus = 'DRAFT' | 'PUBLISHED';

export type FunnelValueStackItem = {
  name: string;
  description: string;
  perceivedValue: string;
};

export type FunnelFaqItem = {
  question: string;
  answer: string;
};

export type FunnelSignupPageContent = {
  type: 'SIGNUP';
  headline: string;
  subheadline: string;
  bullets: string[];
  ctaLabel: string;
  formSuccessRedirectSlug: string;
};

// Mirrors FunnelWorkshopSchedule in zyra-shared: each lead is placed in the
// next daily session after signing up, and the video is locked until then.
export type FunnelWorkshopSchedule = {
  timesOfDay: string[];
  utcOffsetMinutes: number;
  minLeadMinutes: number;
};

export type FunnelWorkshopPageContent = {
  type: 'WORKSHOP';
  videoUrl: string;
  chatEnabled: boolean;
  ctaLabel: string;
  ctaRedirectSlug: string;
  schedule?: FunnelWorkshopSchedule;
};

export type FunnelSalesPageContent = {
  type: 'SALES';
  headline: string;
  valueStack: FunnelValueStackItem[];
  price: string;
  guaranteeText: string;
  faq: FunnelFaqItem[];
  ctaLabel: string;
  checkoutUrl: string;
};

export type FunnelConfirmationPageContent = {
  type: 'CONFIRMATION';
  variant: 'inscricao' | 'compra' | 'pagamento_recusado';
  message: string;
  nextStepLabel: string;
  nextStepUrl: string;
};

export type FunnelPageContent =
  | FunnelSignupPageContent
  | FunnelWorkshopPageContent
  | FunnelSalesPageContent
  | FunnelConfirmationPageContent;

export type FunnelPage = {
  id: string;
  type: FunnelPageType;
  slug: string;
  status: FunnelPageStatus;
  content: FunnelPageContent;
  seoTitle: string | null;
  seoDescription: string | null;
  createdAt: string;
  updatedAt: string;
  __typename: 'FunnelPage';
};
