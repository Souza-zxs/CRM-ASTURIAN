import { styled } from '@linaria/react';
import { type FunnelSalesPageContent } from 'zyra-shared/types';

import { Body } from '@/ui/Body';
import { Button } from '@/ui/Button';
import { Heading } from '@/ui/Heading';
import { SectionShell } from '@/ui/SectionShell';
import { mediaUp, radius, semanticColor, spacing } from '@/tokens';

const ValueStack = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacing(4)};
  margin: ${spacing(8)} 0;
`;

const ValueStackCard = styled.div`
  border: 1px solid ${semanticColor.line};
  border-radius: ${radius(2)};
  padding: ${spacing(5)};
`;

const PerceivedValue = styled.p`
  color: ${semanticColor.inkMuted};
  font-size: 0.85rem;
  margin: ${spacing(2)} 0 0;
`;

const PriceRow = styled.div`
  margin: ${spacing(8)} 0 ${spacing(4)};
`;

const Faq = styled.div`
  margin: ${spacing(8)} 0;

  details {
    border-bottom: 1px solid ${semanticColor.line};
    padding: ${spacing(3)} 0;
  }

  summary {
    cursor: pointer;
    font-weight: 500;
  }
`;

const CtaRow = styled.div`
  display: flex;
  justify-content: center;
  margin-top: ${spacing(8)};

  ${mediaUp('md')} {
    justify-content: flex-start;
  }
`;

type SalesPageViewProps = {
  content: FunnelSalesPageContent;
};

export const SalesPageView = ({ content }: SalesPageViewProps) => {
  return (
    <SectionShell rhythm="hero" scheme="light">
      <Heading as="h1" family="serif" size="xl">
        {content.headline}
      </Heading>

      {content.valueStack.length > 0 && (
        <ValueStack>
          {content.valueStack.map((item) => (
            <ValueStackCard key={item.name}>
              <Heading as="h3" family="sans" size="sm">
                {item.name}
              </Heading>
              <Body muted>{item.description}</Body>
              <PerceivedValue>{item.perceivedValue}</PerceivedValue>
            </ValueStackCard>
          ))}
        </ValueStack>
      )}

      <PriceRow>
        <Heading as="h2" family="serif" size="lg">
          {content.price}
        </Heading>
        <Body muted>{content.guaranteeText}</Body>
      </PriceRow>

      {content.faq.length > 0 && (
        <Faq>
          <Heading as="h2" family="sans" size="sm">
            Perguntas frequentes
          </Heading>
          {content.faq.map((item) => (
            <details key={item.question}>
              <summary>{item.question}</summary>
              <Body muted>{item.answer}</Body>
            </details>
          ))}
        </Faq>
      )}

      <CtaRow>
        <Button href={content.checkoutUrl} label={content.ctaLabel} />
      </CtaRow>
    </SectionShell>
  );
};
