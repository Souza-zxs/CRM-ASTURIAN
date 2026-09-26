'use client';

import { msg } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { styled } from '@linaria/react';
import { useState, type FormEvent } from 'react';

import {
  color,
  FONT_WEIGHT,
  fontFamily,
  fontSize,
  radius,
  spacing,
} from '@/tokens';
import { Button } from '@/ui';

import {
  isContactLeadValid,
  submitContactLead,
  type ContactLeadInput,
} from './submit-contact-lead';

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${spacing(4)};
  width: 100%;
`;

const Label = styled.label`
  color: ${color('white')};
  display: flex;
  flex-direction: column;
  font-family: ${fontFamily('sans')};
  font-size: ${fontSize(3)};
  font-weight: ${FONT_WEIGHT.medium};
  gap: ${spacing(1.5)};
`;

const Input = styled.input`
  background: transparent;
  border: 1px solid ${color('white-60')};
  border-radius: ${radius(2)};
  box-sizing: border-box;
  color: ${color('white')};
  font-family: ${fontFamily('sans')};
  font-size: ${fontSize(4)};
  height: 48px;
  padding: 0 ${spacing(3)};
  width: 100%;

  &::placeholder {
    color: ${color('white-60')};
  }

  &:focus-visible {
    border-color: ${color('white')};
    outline: none;
  }

  &[aria-invalid='true'] {
    border-color: ${color('error')};
  }
`;

const Feedback = styled.p`
  color: ${color('white-60')};
  font-family: ${fontFamily('sans')};
  font-size: ${fontSize(4)};
  margin: 0;
`;

const ErrorText = styled(Feedback)`
  color: ${color('error')};
`;

type FormStatus = 'idle' | 'sending' | 'sent' | 'unavailable';

const EMPTY_LEAD: ContactLeadInput = { email: '', name: '', whatsapp: '' };

export function ContactLeadForm() {
  const { i18n } = useLingui();
  const [lead, setLead] = useState<ContactLeadInput>(EMPTY_LEAD);
  const [status, setStatus] = useState<FormStatus>('idle');
  const [attempted, setAttempted] = useState(false);

  const updateField = (field: keyof ContactLeadInput) => (value: string) =>
    setLead((current) => ({ ...current, [field]: value }));

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setAttempted(true);

    if (!isContactLeadValid(lead) || status === 'sending') {
      return;
    }

    setStatus('sending');
    const result = await submitContactLead(lead);
    setStatus(result.status === 'sent' ? 'sent' : 'unavailable');
  };

  if (status === 'sent') {
    return (
      <Feedback role="status">
        {i18n._(
          msg`Recebemos o seu contato. Em breve nossa equipe fala com você.`,
        )}
      </Feedback>
    );
  }

  const nameInvalid = attempted && lead.name.trim() === '';
  const emailInvalid =
    attempted && !isContactLeadValid({ ...lead, name: 'x', whatsapp: '00000000' });
  const whatsappInvalid =
    attempted && !isContactLeadValid({ ...lead, name: 'x', email: 'x@x.co' });

  return (
    <Form noValidate onSubmit={handleSubmit}>
      <Label>
        {i18n._(msg`Nome`)}
        <Input
          aria-invalid={nameInvalid ? true : undefined}
          autoComplete="name"
          name="name"
          onChange={(event) => updateField('name')(event.target.value)}
          placeholder={i18n._(msg`Seu nome`)}
          value={lead.name}
        />
      </Label>
      <Label>
        {i18n._(msg`E-mail`)}
        <Input
          aria-invalid={emailInvalid ? true : undefined}
          autoComplete="email"
          inputMode="email"
          name="email"
          onChange={(event) => updateField('email')(event.target.value)}
          placeholder={i18n._(msg`voce@empresa.com`)}
          value={lead.email}
        />
      </Label>
      <Label>
        {i18n._(msg`WhatsApp`)}
        <Input
          aria-invalid={whatsappInvalid ? true : undefined}
          autoComplete="tel"
          inputMode="tel"
          name="whatsapp"
          onChange={(event) => updateField('whatsapp')(event.target.value)}
          placeholder={i18n._(msg`(11) 91234-5678`)}
          value={lead.whatsapp}
        />
      </Label>
      {status === 'unavailable' ? (
        <ErrorText role="alert">
          {i18n._(
            msg`Não foi possível enviar agora. Tente novamente em alguns minutos.`,
          )}
        </ErrorText>
      ) : null}
      <Button
        disabled={status === 'sending'}
        label={
          status === 'sending' ? i18n._(msg`Enviando…`) : i18n._(msg`Enviar`)
        }
        type="submit"
      />
    </Form>
  );
}
