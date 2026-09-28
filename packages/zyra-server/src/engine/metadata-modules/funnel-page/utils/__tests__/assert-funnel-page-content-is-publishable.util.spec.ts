import { FunnelPageType } from 'zyra-shared/types';

import { assertFunnelPageContentIsPublishable } from 'src/engine/metadata-modules/funnel-page/utils/assert-funnel-page-content-is-publishable.util';

describe('assertFunnelPageContentIsPublishable', () => {
  it('should not throw when every required field for the type is filled in', () => {
    expect(() =>
      assertFunnelPageContentIsPublishable(FunnelPageType.SALES, {
        type: FunnelPageType.SALES,
        headline: 'Garanta sua vaga',
        valueStack: [],
        price: 'R$ 497',
        guaranteeText: '',
        faq: [],
        ctaLabel: 'Comprar agora',
        checkoutUrl: 'https://checkout.example.com/abc',
      }),
    ).not.toThrow();
  });

  it('should throw listing every missing required field', () => {
    expect(() =>
      assertFunnelPageContentIsPublishable(FunnelPageType.SALES, {
        type: FunnelPageType.SALES,
        headline: '',
        valueStack: [],
        price: 'R$ 497',
        guaranteeText: '',
        faq: [],
        ctaLabel: 'Comprar agora',
        checkoutUrl: '',
      }),
    ).toThrow('Cannot publish: headline, checkoutUrl must be filled in first');
  });

  it('should require the redirect slug for a signup page (an empty one 404s)', () => {
    expect(() =>
      assertFunnelPageContentIsPublishable(FunnelPageType.SIGNUP, {
        type: FunnelPageType.SIGNUP,
        headline: 'Inscreva-se',
        subheadline: '',
        bullets: [],
        ctaLabel: 'Quero participar',
        formSuccessRedirectSlug: '',
      }),
    ).toThrow('formSuccessRedirectSlug');
  });

  it('should require the video url for a workshop page (an empty one renders a dead player)', () => {
    expect(() =>
      assertFunnelPageContentIsPublishable(FunnelPageType.WORKSHOP, {
        type: FunnelPageType.WORKSHOP,
        videoUrl: '',
        chatEnabled: false,
        ctaLabel: 'Continuar',
        ctaRedirectSlug: 'vendas',
      }),
    ).toThrow('videoUrl');
  });

  it('should require the next-step url for a confirmation page (an empty one 404s)', () => {
    expect(() =>
      assertFunnelPageContentIsPublishable(FunnelPageType.CONFIRMATION, {
        type: FunnelPageType.CONFIRMATION,
        variant: 'compra',
        message: 'Obrigado!',
        nextStepLabel: 'Continuar',
        nextStepUrl: '',
      }),
    ).toThrow('nextStepUrl');
  });
});
