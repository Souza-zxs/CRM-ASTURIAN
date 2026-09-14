import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';

// Identifies which halftone model fills the card's stage.
export type IllustrationId =
  | 'diamond'
  | 'eye'
  | 'flash'
  | 'lock'
  | 'singleScreen'
  | 'speed';

// Attribution and its case-study link only render when present — the
// product cards carry neither.
export type IllustrationCardRecord = {
  attribution?: { role: MessageDescriptor; company: MessageDescriptor };
  body: MessageDescriptor;
  caseStudySlug?: string;
  heading: MessageDescriptor;
  illustration: IllustrationId;
};

export const ILLUSTRATION_CARDS: readonly IllustrationCardRecord[] = [
  {
    heading: msg`Qualidade de produção`,
    body: msg`Modelo de dados, permissões, autenticação e motor de automação prontos para operar em escala, sem gambiarra por trás.`,
    illustration: 'diamond',
  },
  {
    heading: msg`IA para iterar rápido`,
    body: msg`Descreva o que precisa em português e deixe a IA montar campos, views e automações — o que levaria semanas de configuração vira minutos.`,
    illustration: 'flash',
  },
  {
    heading: msg`Controle sem travar o time`,
    body: msg`Rode auto-hospedado, sem risco de fornecedor e sem migração forçada quando o seu processo muda.`,
    illustration: 'lock',
  },
];
