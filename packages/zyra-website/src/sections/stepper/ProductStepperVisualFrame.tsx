import { css } from '@linaria/core';
import { styled } from '@linaria/react';
import { type ReactNode } from 'react';

import { Image } from '@/ui';

// The product stepper's stage: its own authored artwork (the dark
// notched shape with the dash pattern over it), ported verbatim — unlike
// the home frame, the stage here is baked into the two webps.
const BACKGROUND_SRC = '/images/product/stepper/background.webp';
const SHAPE_SRC = '/images/product/stepper/background-shape.webp';

const FrameRoot = styled.div`
  aspect-ratio: 672 / 705;
  position: relative;
  width: 100%;
`;

const ShapeOverlay = styled.div`
  inset: 0;
  pointer-events: none;
  position: absolute;
  z-index: 0;
`;

const shapeImageClassName = css`
  height: 100%;
  object-fit: fill;
  object-position: center;
  width: 100%;
`;

const PatternBackdrop = styled.div`
  inset: 0;
  opacity: 0.55;
  pointer-events: none;
  position: absolute;
  z-index: 1;
`;

const patternImageClassName = css`
  object-fit: cover;
  object-position: center;
`;

const SlideArea = styled.div`
  inset: 6%;
  position: absolute;
  z-index: 2;
`;

export function ProductStepperVisualFrame({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <FrameRoot>
      <ShapeOverlay aria-hidden>
        <Image
          alt=""
          className={shapeImageClassName}
          fill
          priority={false}
          src={SHAPE_SRC}
        />
      </ShapeOverlay>
      <PatternBackdrop aria-hidden>
        <Image
          alt=""
          className={patternImageClassName}
          fill
          src={BACKGROUND_SRC}
        />
      </PatternBackdrop>
      <SlideArea>{children}</SlideArea>
    </FrameRoot>
  );
}
