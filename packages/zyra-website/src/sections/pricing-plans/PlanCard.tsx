'use client';

import { msg } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { css } from '@linaria/core';
import { styled } from '@linaria/react';

import { TalkToUsButton } from '@/contact-cal';
import { useAnimatedNumber } from '@/platform/motion';
import { color, mediaUp, radius, semanticColor, spacing } from '@/tokens';
import { Body, Button, Heading, Image } from '@/ui';

import {
  PLANS_DATA,
  type PlansBillingPeriod,
  type PlansTierId,
} from './plans-data';
import { PlanFeatureList } from './PlanFeatureList';
import { useFeatureTransition } from './use-feature-transition';

const CardShell = styled.div`
  background-color: ${color('white')};
  border: 1px solid transparent;
  border-radius: ${radius(2)};
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
  overflow: hidden;
  padding: ${spacing(4)};
  position: relative;
  z-index: 1;

  & > * + * {
    margin-top: ${spacing(4)};
  }
`;

const CardHeader = styled.div`
  align-items: flex-start;
  display: flex;
  flex-shrink: 0;
  gap: ${spacing(3)};
  justify-content: space-between;
`;

const CardHeaderInfo = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  min-width: 0;
  overflow: hidden;

  & > * + * {
    margin-top: ${spacing(4)};
  }
`;

// The title and price guard against long localized strings: they ellipsis
// (or, for the price line, hold one line) on desktop where the two cards
// share the row width. Ported from the old card.
const titleClassName = css`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const PriceLine = styled.div`
  align-items: baseline;
  column-gap: ${spacing(1)};
  display: flex;
  flex-wrap: wrap;
  min-width: 0;

  ${mediaUp('md')} {
    flex-wrap: nowrap;
    overflow: hidden;
    white-space: nowrap;
  }
`;

const priceSuffixClassName = css`
  color: ${color('black-60')};
  display: block;
  min-width: 0;

  ${mediaUp('md')} {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
`;

const CardRule = styled.div`
  border-top: 1px dotted ${semanticColor.divider};
  flex-shrink: 0;
  height: 0;
  width: 100%;
`;

const CardIcon = styled.div<{ $widthPx: number }>`
  border-radius: ${radius(2)};
  flex-shrink: 0;
  height: 80px;
  margin-left: auto;
  overflow: hidden;
  position: relative;
  width: ${({ $widthPx }) => `${$widthPx}px`};

  img {
    object-fit: contain;
    object-position: center right;
  }
`;

const CtaRow = styled.div`
  flex-shrink: 0;
  width: 100%;

  > * {
    display: flex;
    width: 100%;
  }
`;

const PRICE_NUMBER_FORMATTER = new Intl.NumberFormat('en-US');

export function PlanCard({
  billing,
  highlighted = false,
  maxBullets,
  tierId,
}: {
  billing: PlansBillingPeriod;
  highlighted?: boolean;
  maxBullets: number;
  tierId: PlansTierId;
}) {
  const { i18n } = useLingui();
  const tier = PLANS_DATA[tierId];
  const cell = tier.cells[billing];
  const iconWidth = tier.icon.widthPx ?? 80;
  const animatedPriceValue = useAnimatedNumber(
    cell.price.kind === 'numeric' ? cell.price.value : 0,
  );
  const { comparisonBulletTexts, phase, visibleBullets } = useFeatureTransition(
    cell.featureBullets,
  );

  return (
    <CardShell>
      <CardHeader>
        <CardHeaderInfo>
          <Heading
            as="h3"
            className={titleClassName}
            family="sans"
            size="xs"
            weight="light"
          >
            {i18n._(tier.heading)}
          </Heading>
          <PriceLine>
            {cell.price.kind === 'numeric' ? (
              <>
                <Heading as="h4" family="sans" size="sm" weight="regular">
                  {`${cell.price.prefix}${PRICE_NUMBER_FORMATTER.format(animatedPriceValue)}`}
                </Heading>
                <Body as="span" className={priceSuffixClassName} size="sm">
                  {i18n._(cell.price.suffix)}
                </Body>
              </>
            ) : (
              <Heading as="h4" family="sans" size="sm" weight="regular">
                {i18n._(cell.price.label)}
              </Heading>
            )}
          </PriceLine>
        </CardHeaderInfo>
        <CardIcon $widthPx={iconWidth}>
          <Image alt={tier.icon.alt} fill src={tier.icon.src} />
        </CardIcon>
      </CardHeader>

      <CardRule />

      <PlanFeatureList
        comparisonBulletTexts={comparisonBulletTexts}
        maxBullets={maxBullets}
        phase={phase}
        visibleBullets={visibleBullets}
      />

      <CtaRow>
        {cell.price.kind === 'custom' ? (
          <TalkToUsButton
            label={msg`Falar com a gente`}
            variant={highlighted ? 'filled' : 'outlined'}
          />
        ) : (
          <Button
            href="https://app.zyra.com/welcome"
            label={i18n._(msg`Começar grátis`)}
            variant={highlighted ? 'filled' : 'outlined'}
          />
        )}
      </CtaRow>
    </CardShell>
  );
}
