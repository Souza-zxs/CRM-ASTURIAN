import { FunnelPageType } from 'zyra-shared/types';

import { assertFunnelPageContentMatchesType } from 'src/engine/metadata-modules/funnel-page/utils/assert-funnel-page-content-matches-type.util';

describe('assertFunnelPageContentMatchesType', () => {
  it('should not throw when content.type matches the page type', () => {
    expect(() =>
      assertFunnelPageContentMatchesType(FunnelPageType.WORKSHOP, {
        type: FunnelPageType.WORKSHOP,
        videoUrl: 'https://youtu.be/abc',
        chatEnabled: false,
        ctaLabel: 'Continuar',
        ctaRedirectSlug: 'vendas',
      }),
    ).not.toThrow();
  });

  it('should throw when content.type does not match the page type', () => {
    expect(() =>
      assertFunnelPageContentMatchesType(FunnelPageType.WORKSHOP, {
        type: FunnelPageType.SIGNUP,
        headline: '',
        subheadline: '',
        bullets: [],
        ctaLabel: '',
        formSuccessRedirectSlug: '',
      }),
    ).toThrow(
      'Funnel page content type "SIGNUP" does not match page type "WORKSHOP"',
    );
  });
});
