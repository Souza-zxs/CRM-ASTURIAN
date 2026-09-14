'use client';

import { styled } from '@linaria/react';
import { useState } from 'react';

import { HERO_COMPOSITION, mediaUp, spacing } from '@/tokens';

import { BillingToggle } from './BillingToggle';
import { PlanCard } from './PlanCard';
import { PLANS_DATA, type PlansBillingPeriod } from './plans-data';

// The interactive island below the intro: the switcher and the cards.
// It sits 32px under the intro (the hero's intro-to-CTA gap); the cards
// hang 68px under the switcher (the hero's CTA-to-mockup measure).
const Board = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  margin-top: ${spacing(8)};
  width: 100%;
`;

const CardsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  margin-top: ${HERO_COMPOSITION.ctaToVisualGapPx}px;
  row-gap: ${spacing(4)};
  width: 100%;

  ${mediaUp('md')} {
    column-gap: ${spacing(6)};
    grid-template-columns: 1fr 1fr;
    row-gap: 0;
  }
`;

export function PricingBoard() {
  const [billing, setBilling] = useState<PlansBillingPeriod>('yearly');

  const maxBullets = Math.max(
    PLANS_DATA.pro.cells[billing].featureBullets.length,
    PLANS_DATA.organization.cells[billing].featureBullets.length,
  );

  return (
    <Board>
      <BillingToggle billing={billing} onBillingChange={setBilling} />
      <CardsGrid>
        <PlanCard billing={billing} maxBullets={maxBullets} tierId="pro" />
        <PlanCard
          billing={billing}
          highlighted
          maxBullets={maxBullets}
          tierId="organization"
        />
      </CardsGrid>
    </Board>
  );
}
