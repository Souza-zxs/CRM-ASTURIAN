import { BadRequestException } from '@nestjs/common';

import { isNonEmptyString } from '@sniptt/guards';
import { type FunnelPageContent, FunnelPageType } from 'zyra-shared/types';

// Each field below drives something that breaks visibly, with no error
// shown, when it's left empty: an empty formSuccessRedirectSlug/
// ctaRedirectSlug/nextStepUrl navigates to a blank slug (404), an empty
// videoUrl renders a dead video player, an empty checkoutUrl makes the CTA a
// no-op. Optional list fields (bullets, valueStack, faq) already render fine
// empty and are deliberately left out. Drafts can stay incomplete; this only
// gates the moment a page goes live.
const REQUIRED_FIELDS_BY_TYPE: Record<FunnelPageType, string[]> = {
  [FunnelPageType.SIGNUP]: ['headline', 'ctaLabel', 'formSuccessRedirectSlug'],
  [FunnelPageType.WORKSHOP]: ['videoUrl', 'ctaLabel', 'ctaRedirectSlug'],
  [FunnelPageType.SALES]: ['headline', 'ctaLabel', 'checkoutUrl'],
  [FunnelPageType.CONFIRMATION]: ['message', 'nextStepLabel', 'nextStepUrl'],
};

export const assertFunnelPageContentIsPublishable = (
  type: FunnelPageType,
  content: FunnelPageContent,
): void => {
  const missingFields = REQUIRED_FIELDS_BY_TYPE[type].filter(
    (field) => !isNonEmptyString((content as Record<string, unknown>)[field]),
  );

  if (missingFields.length > 0) {
    throw new BadRequestException(
      `Cannot publish: ${missingFields.join(', ')} must be filled in first`,
    );
  }
};
