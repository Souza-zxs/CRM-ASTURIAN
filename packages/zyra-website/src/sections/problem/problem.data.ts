import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';

export type ProblemPoint = {
  heading: MessageDescriptor;
  body: MessageDescriptor;
};

export const PROBLEM_POINTS: readonly ProblemPoint[] = [
  {
    heading: msg`O CRM engessado`,
    body: msg`Telas prontas que não batem com o seu processo, campos que você não pode mudar e uma fila de suporte pra qualquer ajuste simples.`,
  },
  {
    heading: msg`A planilha que virou sistema`,
    body: msg`Funciona até certo ponto — depois disso, cada pessoa nova no time é mais uma versão diferente da "verdade" sobre um cliente.`,
  },
];
