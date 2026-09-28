import { styled } from '@linaria/react';

import { HalftoneModel } from '@/platform/visuals/rigs/HalftoneModel';
import { mediaUp, radius } from '@/tokens';

import { FOUNDER_QUOTE_VISUAL } from './founder-quote-config';

// The quote-mark GLB renders at this size and the carousel scales it up; it's
// decorative (the decoration container is desktop-only + aria-hidden).
const QuoteFrame = styled.div`
  border-radius: ${radius(1)};
  height: 279px;
  overflow: hidden;
  position: relative;
  width: 198px;

  ${mediaUp('md')} {
    height: 476px;
    width: 336px;
  }
`;

export function FounderQuoteVisual() {
  return (
    <QuoteFrame data-illustration="founder-quote">
      <HalftoneModel
        initialPose={FOUNDER_QUOTE_VISUAL.initialPose}
        modelUrl={FOUNDER_QUOTE_VISUAL.modelUrl}
        settings={FOUNDER_QUOTE_VISUAL.settings}
      />
    </QuoteFrame>
  );
}
