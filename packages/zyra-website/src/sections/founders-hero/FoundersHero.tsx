import { msg } from '@lingui/core/macro';
import { styled } from '@linaria/react';

import { TalkToUsButton } from '@/contact-cal';
import { getServerI18n } from '@/platform/i18n/get-server-i18n';
import { GRADIENT, HERO_COMPOSITION, mediaUp, spacing } from '@/tokens';
import { Body, Heading, HeadingPair, SectionShell } from '@/ui';

import { FoundersVisual } from './FoundersVisual';

const GradientBackdrop = styled.div`
  background: ${GRADIENT.heroGlow};
  inset: 0 -20%;
  position: absolute;
`;

// The hero reads as one composition on the shared hero rhythm (HomeHero /
// PricingHero): Heading->Body 12px (HeadingPair), Body->CTA 32px, CTA->visual
// 68px (HERO_COMPOSITION). The intro is centered; the halftone stage hangs
// below at that single CTA-to-visual step.
const IntroStack = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  text-align: center;
  width: 100%;

  & > * + * {
    margin-top: ${spacing(8)};
  }
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
    max-width: 500px;
  }
`;

const CtaRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${spacing(3)};
  justify-content: center;
`;

const VisualStage = styled.div`
  margin-top: ${HERO_COMPOSITION.ctaToVisualGapPx}px;
  width: 100%;
`;

export function FoundersHero() {
  const i18n = getServerI18n();

  return (
    <SectionShell
      background={<GradientBackdrop />}
      rhythm="hero"
      scheme="light"
    >
      <IntroStack>
        <HeadingPair>
          <HeadingMeasure>
            <Heading as="h1" size="lg" weight="light">
              {i18n._(msg`Quem criou\n*o Zyra*`)}
            </Heading>
          </HeadingMeasure>
          <BodyMeasure>
            <Body muted size="sm">
              {i18n._(
                msg`O Zyra nasceu na Horizon, uma empresa de tecnologia feita por quem vive vendas: um CRM que as equipes realmente querem usar, com WhatsApp, dashboards e funil no mesmo lugar.`,
              )}
            </Body>
          </BodyMeasure>
        </HeadingPair>
        <CtaRow>
          <TalkToUsButton label={msg`Falar com a gente`} />
        </CtaRow>
      </IntroStack>
      <VisualStage>
        <FoundersVisual />
      </VisualStage>
    </SectionShell>
  );
}
