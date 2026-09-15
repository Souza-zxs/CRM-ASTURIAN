import { type FunnelPageType } from './FunnelPageType';

export type FunnelSignupPageContent = {
  type: FunnelPageType.SIGNUP;
  headline: string;
  subheadline: string;
  bullets: string[];
  ctaLabel: string;
  formSuccessRedirectSlug: string;
};

export type FunnelWorkshopPageContent = {
  type: FunnelPageType.WORKSHOP;
  videoUrl: string;
  chatEnabled: boolean;
  ctaLabel: string;
  ctaRedirectSlug: string;
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
