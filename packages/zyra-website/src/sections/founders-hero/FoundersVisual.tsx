import { styled } from '@linaria/react';

import { HalftoneModel } from '@/platform/visuals/rigs/HalftoneModel';
import { color, mediaUp, radius } from '@/tokens';

import { FOUNDERS_HERO_VISUAL } from './founders-visual-config';

// Decorative stage on the dark panel: the heading carries the meaning, so the
// frame is hidden from assistive tech.
const VisualFrame = styled.div`
  background-color: ${color('black')};
  border-radius: ${radius(1)};
  height: 360px;
  overflow: hidden;
  position: relative;
  width: 100%;

  ${mediaUp('md')} {
    height: 462px;
  }
`;

export function FoundersVisual() {
  return (
    <VisualFrame aria-hidden data-illustration="founders-hero">
      <HalftoneModel
        geometryOptions={FOUNDERS_HERO_VISUAL.geometryOptions}
        initialPose={FOUNDERS_HERO_VISUAL.initialPose}
        modelUrl={FOUNDERS_HERO_VISUAL.modelUrl}
        priority
        settings={FOUNDERS_HERO_VISUAL.settings}
      />
    </VisualFrame>
  );
}
