import { type FunnelSalesPageContent } from '@/funnel/types/FunnelPage';
import { styled } from '@linaria/react';
import { Button } from 'zyra-ui/input';
import { Section } from 'zyra-ui/layout';
import { themeCssVariables } from 'zyra-ui/theme-constants';
import { H1Title, H2Title, H3Title } from 'zyra-ui/typography';

const StyledPage = styled.div`
  display: flex;
  justify-content: center;
  min-height: 100dvh;
  padding: ${themeCssVariables.spacing[8]} ${themeCssVariables.spacing[4]};
`;

const StyledContent = styled.div`
  max-width: 720px;
  width: 100%;
`;

const StyledValueStack = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[4]};
  margin: ${themeCssVariables.spacing[8]} 0;
`;

const StyledValueStackCard = styled.div`
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.md};
  padding: ${themeCssVariables.spacing[5]};
`;

const StyledPerceivedValue = styled.p`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: 0.85rem;
  margin: ${themeCssVariables.spacing[2]} 0 0;
`;

const StyledPriceBlock = styled.div`
  margin: ${themeCssVariables.spacing[8]} 0 ${themeCssVariables.spacing[4]};
`;

const StyledGuarantee = styled.p`
  color: ${themeCssVariables.font.color.secondary};
`;

const StyledFaq = styled.div`
  margin: ${themeCssVariables.spacing[8]} 0;

  details {
    border-bottom: 1px solid ${themeCssVariables.border.color.medium};
    padding: ${themeCssVariables.spacing[3]} 0;
  }

  summary {
    cursor: pointer;
    font-weight: 500;
  }
`;

const StyledCtaRow = styled.div`
  display: flex;
  justify-content: center;
  margin-top: ${themeCssVariables.spacing[8]};
`;

type SalesPageViewProps = {
  content: FunnelSalesPageContent;
};

export const SalesPageView = ({ content }: SalesPageViewProps) => {
  return (
    <StyledPage>
      <StyledContent>
        <Section>
          <H1Title title={content.headline} />

          {content.valueStack.length > 0 && (
            <StyledValueStack>
              {content.valueStack.map((item) => (
                <StyledValueStackCard key={item.name}>
                  <H3Title title={item.name} />
                  <p>{item.description}</p>
                  <StyledPerceivedValue>
                    {item.perceivedValue}
                  </StyledPerceivedValue>
                </StyledValueStackCard>
              ))}
            </StyledValueStack>
          )}

          <StyledPriceBlock>
            <H2Title title={content.price} />
            <StyledGuarantee>{content.guaranteeText}</StyledGuarantee>
          </StyledPriceBlock>

          {content.faq.length > 0 && (
            <StyledFaq>
              <H2Title title="Perguntas frequentes" />
              {content.faq.map((item) => (
                <details key={item.question}>
                  <summary>{item.question}</summary>
                  <p>{item.answer}</p>
                </details>
              ))}
            </StyledFaq>
          )}

          <StyledCtaRow>
            <Button
              title={content.ctaLabel}
              // checkoutUrl is a real external payment link — Button's `to`
              // prop only renders a react-router Link (internal navigation),
              // so an external redirect goes through onClick instead.
              onClick={() => {
                window.location.href = content.checkoutUrl;
              }}
            />
          </StyledCtaRow>
        </Section>
      </StyledContent>
    </StyledPage>
  );
};
