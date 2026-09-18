'use client';

import { styled } from '@linaria/react';
import { type ComponentType } from 'react';

import { DataModelVisual } from './DataModelVisual';
import { LayoutVisual } from './LayoutVisual';
import { WorkflowVisual } from './WorkflowVisual';

const STEP_VISUALS: readonly {
  id: string;
  Visual: ComponentType<{ active: boolean }>;
}[] = [
  { id: 'data-model', Visual: DataModelVisual },
  { id: 'workflow', Visual: WorkflowVisual },
  { id: 'layout', Visual: LayoutVisual },
];

// Matches the product stepper's frame convention: the card chrome lives 6%
// in from the notched frame's edge.
const SlideArea = styled.div`
  inset: 6%;
  position: absolute;
`;

const Slide = styled.div`
  inset: 0;
  opacity: 0;
  pointer-events: none;
  position: absolute;
  transition: opacity 0.4s ease;

  &[data-active] {
    opacity: 1;
    pointer-events: auto;
  }
`;

const SlideInner = styled.div`
  display: flex;
  height: 100%;
  width: 100%;
`;

// The stepper's visual stage: one card per step, crossfading with the
// active step exactly like the product page's stepper.
export function StepperVisual({
  activeStepIndex,
}: {
  activeStepIndex: number;
}) {
  return (
    <SlideArea>
      {STEP_VISUALS.map(({ id, Visual }, stepNumber) => {
        const isActive = stepNumber === activeStepIndex;
        return (
          <Slide data-active={isActive ? '' : undefined} key={id}>
            <SlideInner>
              <Visual active={isActive} />
            </SlideInner>
          </Slide>
        );
      })}
    </SlideArea>
  );
}
