import { type FunnelSignupPageContent } from '@/funnel/types/FunnelPage';
import { submitFunnelLead } from '@/funnel/api/submit-funnel-lead';
import { SettingsTextInput } from '@/ui/input/components/SettingsTextInput';
import { styled } from '@linaria/react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from 'zyra-ui/input';
import { Section } from 'zyra-ui/layout';
import { themeCssVariables } from 'zyra-ui/theme-constants';
import { H1Title } from 'zyra-ui/typography';

const StyledPage = styled.div`
  align-items: center;
  display: flex;
  justify-content: center;
  min-height: 100dvh;
  padding: ${themeCssVariables.spacing[8]} ${themeCssVariables.spacing[4]};
`;

const StyledContent = styled.div`
  max-width: 560px;
  width: 100%;
`;

const StyledSubheadline = styled.p`
  color: ${themeCssVariables.font.color.secondary};
  margin-top: ${themeCssVariables.spacing[3]};
`;

const StyledBullets = styled.ul`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
  margin: ${themeCssVariables.spacing[6]} 0;
  padding-left: ${themeCssVariables.spacing[5]};
`;

const StyledForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[4]};
  margin-top: ${themeCssVariables.spacing[6]};
`;

const StyledError = styled.p`
  color: ${themeCssVariables.color.red};
  margin: 0;
`;

type SignupPageViewProps = {
  funnelPageId: string;
  content: FunnelSignupPageContent;
};

export const SignupPageView = ({
  funnelPageId,
  content,
}: SignupPageViewProps) => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const { leadId } = await submitFunnelLead({
        funnelPageId,
        name,
        email,
        whatsapp,
      });

      // The lead id follows the visitor through the funnel so later steps
      // (workshop, purchase) can update the same person in the CRM.
      navigate(
        `/w/${content.formSuccessRedirectSlug}?lead=${encodeURIComponent(leadId)}`,
      );
    } catch {
      setError('Não foi possível enviar sua inscrição. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <StyledPage>
      <StyledContent>
        <Section>
          <H1Title title={content.headline} />
          <StyledSubheadline>{content.subheadline}</StyledSubheadline>
          {content.bullets.length > 0 && (
            <StyledBullets>
              {content.bullets.map((bullet) => (
                <li key={bullet}>{bullet}</li>
              ))}
            </StyledBullets>
          )}
          <StyledForm onSubmit={handleSubmit}>
            <SettingsTextInput
              instanceId="funnel-signup-name"
              label="Nome"
              value={name}
              onChange={setName}
              fullWidth
            />
            <SettingsTextInput
              instanceId="funnel-signup-email"
              label="E-mail"
              value={email}
              onChange={setEmail}
              fullWidth
            />
            <SettingsTextInput
              instanceId="funnel-signup-whatsapp"
              label="WhatsApp"
              value={whatsapp}
              onChange={setWhatsapp}
              fullWidth
            />
            {error !== null && <StyledError>{error}</StyledError>}
            <Button
              title={isSubmitting ? 'Enviando...' : content.ctaLabel}
              disabled={isSubmitting}
              type="submit"
              fullWidth
            />
          </StyledForm>
        </Section>
      </StyledContent>
    </StyledPage>
  );
};
