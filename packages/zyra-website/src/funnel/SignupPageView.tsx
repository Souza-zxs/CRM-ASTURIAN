import { styled } from '@linaria/react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { type FunnelSignupPageContent } from 'zyra-shared/types';

import { submitFunnelLead } from '@/funnel/api/submitFunnelLead';
import { Body } from '@/ui/Body';
import { Button } from '@/ui/Button';
import { Field } from '@/ui/Field';
import { Heading } from '@/ui/Heading';
import { SectionShell } from '@/ui/SectionShell';
import { TextField } from '@/ui/TextField';
import { spacing } from '@/tokens';

const Bullets = styled.ul`
  display: flex;
  flex-direction: column;
  gap: ${spacing(2)};
  margin: ${spacing(6)} 0;
  padding: 0;

  li {
    list-style: none;
    padding-inline-start: ${spacing(4)};
    position: relative;

    &::before {
      content: '—';
      left: 0;
      position: absolute;
    }
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${spacing(4)};
  margin-top: ${spacing(6)};
  max-width: 420px;
`;

const ErrorText = styled.p`
  color: #c0392b;
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
      await submitFunnelLead({ funnelPageId, name, email, whatsapp });
      navigate(`/w/${content.formSuccessRedirectSlug}`);
    } catch {
      setError('Não foi possível enviar sua inscrição. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SectionShell rhythm="hero" scheme="light">
      <Heading as="h1" family="serif" size="xl">
        {content.headline}
      </Heading>
      <Body muted size="md">
        {content.subheadline}
      </Body>
      {content.bullets.length > 0 && (
        <Bullets>
          {content.bullets.map((bullet) => (
            <li key={bullet}>
              <Body as="span">{bullet}</Body>
            </li>
          ))}
        </Bullets>
      )}
      <Form onSubmit={handleSubmit}>
        <Field label="Nome">
          <TextField
            ariaLabel="Nome"
            name="name"
            onValueChange={setName}
            value={name}
          />
        </Field>
        <Field label="E-mail">
          <TextField
            ariaLabel="E-mail"
            inputMode="email"
            name="email"
            onValueChange={setEmail}
            value={email}
          />
        </Field>
        <Field label="WhatsApp">
          <TextField
            ariaLabel="WhatsApp"
            name="whatsapp"
            onValueChange={setWhatsapp}
            value={whatsapp}
          />
        </Field>
        {error !== null && <ErrorText>{error}</ErrorText>}
        <Button
          disabled={isSubmitting}
          label={isSubmitting ? 'Enviando...' : content.ctaLabel}
          type="submit"
        />
      </Form>
    </SectionShell>
  );
};
