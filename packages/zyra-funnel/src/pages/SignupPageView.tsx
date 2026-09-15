import { submitFunnelLead } from '@/api/submitFunnelLead';
import { type FunnelSignupPageContent } from '@/types/FunnelPageContent';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

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
      navigate(`/${content.formSuccessRedirectSlug}`);
    } catch {
      setError('Não foi possível enviar sua inscrição. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="page page--signup">
      <h1>{content.headline}</h1>
      <p className="subheadline">{content.subheadline}</p>
      {content.bullets.length > 0 && (
        <ul className="bullets">
          {content.bullets.map((bullet, index) => (
            <li key={index}>{bullet}</li>
          ))}
        </ul>
      )}
      <form className="signup-form" onSubmit={handleSubmit}>
        <label>
          Nome
          <input
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
          />
        </label>
        <label>
          E-mail
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </label>
        <label>
          WhatsApp
          <input
            type="tel"
            value={whatsapp}
            onChange={(event) => setWhatsapp(event.target.value)}
            required
          />
        </label>
        {error !== null && <p className="form-error">{error}</p>}
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Enviando...' : content.ctaLabel}
        </button>
      </form>
    </main>
  );
};
