import { BadRequestException } from '@nestjs/common';

import { type FunnelPageContent, type FunnelPageType } from 'zyra-shared/types';

// `content` is a discriminated union keyed by its own `type`, but nothing at
// the GraphQL layer ties that to the row's `type` column — a caller (the
// admin form always keeps them in sync, but a direct API call doesn't have
// to) can save a WORKSHOP row with SIGNUP content. The public page's switch
// on content.type then matches nothing and renders blank, with no error
// visible anywhere. Every create/update must go through this first.
export const assertFunnelPageContentMatchesType = (
  type: FunnelPageType,
  content: FunnelPageContent,
): void => {
  if (content.type !== type) {
    throw new BadRequestException(
      `Funnel page content type "${content.type}" does not match page type "${type}"`,
    );
  }
};
