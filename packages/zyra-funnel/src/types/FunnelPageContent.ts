// Standalone copy of packages/zyra-shared/src/types/FunnelPageContent.ts —
// this app is deployed independently of the main monorepo apps, so it
// doesn't depend on zyra-shared at build time. Keep in sync by hand if the
// backend shape changes.

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

export type FunnelWorkshopPageContent = {
  type: 'WORKSHOP';
  videoUrl: string;
  chatEnabled: boolean;
  ctaLabel: string;
  ctaRedirectSlug: string;
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

export type FunnelPageResponse = {
  id: string;
  type: FunnelPageContent['type'];
  content: FunnelPageContent;
  seoTitle: string | null;
  seoDescription: string | null;
};
