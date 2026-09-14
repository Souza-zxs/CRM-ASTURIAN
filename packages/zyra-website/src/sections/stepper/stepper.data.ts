import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';

export type StepperStep = {
  body: MessageDescriptor;
  heading: MessageDescriptor;
};

export const STEPPER_STEPS: readonly StepperStep[] = [
  {
    heading: msg`Comece com *blocos prontos* de verdade`,
    body: msg`Componha seu CRM e seus apps internos com um único conjunto de ferramentas. Modelo de dados, layout e automação, já no lugar.`,
  },
  {
    heading: msg`Continue ajustando *sem fricção*`,
    body: msg`Personalize sem limite usando as ferramentas de IA que você já usa no dia a dia. Adapte o CRM no ritmo em que o seu negócio muda.`,
  },
  {
    heading: msg`Fique no controle, *sem depender de um único fornecedor*`,
    body: msg`Rode auto-hospedado se quiser: setup local, dados reais, testes ao vivo, sem ferramenta proprietária te prendendo.`,
  },
];
