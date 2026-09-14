import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';

// Which animated product scene mounts in the card frame when the mockup
// wave (with AppPreview) lands; until then the gradient backdrop — the
// scene's own bottom layer — fills the frame.
export type FeatureIllustrationId =
  | 'familiar-interface'
  | 'live-data'
  | 'fast-path';

export type FeatureCardRecord = {
  backgroundImageSrc: string;
  body: MessageDescriptor;
  heading: MessageDescriptor;
  icon: 'users-group' | 'live-data' | 'fast-path';
  illustration: FeatureIllustrationId;
};

export const FEATURE_CARDS: readonly FeatureCardRecord[] = [
  {
    heading: msg`Interface simples, sem curva de aprendizado`,
    body: msg`O Zyra é direto ao ponto: limpo, intuitivo, feito pra parecer familiar desde o primeiro acesso.`,
    backgroundImageSrc:
      '/images/home/three-cards-feature/familiar-interface-gradient.webp',
    icon: 'users-group',
    illustration: 'familiar-interface',
  },
  {
    heading: msg`Dados em tempo real, com IA embutida`,
    body: msg`Tudo atualiza na hora, com um chat de IA sempre à mão pra te ajudar a trabalhar mais rápido.`,
    backgroundImageSrc:
      '/images/home/three-cards-feature/live-data-gradient.webp',
    icon: 'live-data',
    illustration: 'live-data',
  },
  {
    heading: msg`Caminho rápido pra ação`,
    body: msg`Atalhos, padrões inteligentes e layouts pensados pra deixar as tarefas do dia a dia mais rápidas de executar.`,
    backgroundImageSrc:
      '/images/home/three-cards-feature/fast-path-gradient.webp',
    icon: 'fast-path',
    illustration: 'fast-path',
  },
];
