import { styled } from '@linaria/react';
import { msg } from '@lingui/core/macro';

import { getServerI18n } from '@/platform/i18n/get-server-i18n';
import { HERO_COMPOSITION, mediaUp } from '@/tokens';
import { Body, Heading, HeadingPair, SectionShell } from '@/ui';

import { WhyZyraVisual } from './WhyZyraVisual';

// No CTA here, so the visual hangs 68px below the intro (HERO_COMPOSITION) —
// the same CTA-to-visual step the other heroes use. The heading takes the
// shared `lg` size (the old site drifted to xl; normalized for consistency).
const IntroStack = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  text-align: center;
  width: 100%;
`;

const HeadingMeasure = styled.div`
  max-width: 360px;
  width: 100%;

  ${mediaUp('md')} {
    max-width: 672px;
  }
`;

const BodyMeasure = styled.div`
  margin-inline: auto;
  max-width: 360px;

  ${mediaUp('md')} {
    max-width: 443px;
  }
`;

const VisualStage = styled.div`
  margin-top: ${HERO_COMPOSITION.ctaToVisualGapPx}px;
  width: 100%;
`;

export function WhyZyraHero() {
  const i18n = getServerI18n();

  return (
    <SectionShell rhythm="hero" scheme="dark">
      <IntroStack>
        <HeadingPair>
          <HeadingMeasure>
            <Heading as="h1" size="lg" weight="light">
              {i18n._(msg`O futuro do CRM se constrói, *não se compra.*`)}
            </Heading>
          </HeadingMeasure>
          <BodyMeasure>
            <Body muted size="sm">
              {i18n._(
                msg`CRM era um banco de dados que você preenchia às sextas. A IA transformou isso no sistema que roda seu go-to-market. Pra se diferenciar, você precisa construir o que seus concorrentes não conseguem comprar.`,
              )}
            </Body>
          </BodyMeasure>
        </HeadingPair>
      </IntroStack>
      <VisualStage>
        <WhyZyraVisual />
      </VisualStage>
    </SectionShell>
  );
}
