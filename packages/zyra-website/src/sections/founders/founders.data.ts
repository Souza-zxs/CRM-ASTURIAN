import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';

export type FounderRecord = {
  bio: MessageDescriptor;
  designation: MessageDescriptor;
  name: MessageDescriptor;
  portraitSrc: string;
};

export const FOUNDERS: readonly FounderRecord[] = [
  {
    name: msg`Daniel Lucas Souza`,
    designation: msg`CEO e fundador, Horizon`,
    bio: msg`Daniel imaginou o Zyra e o levou de uma ideia a um produto completo. Como CEO da Horizon, une visão de produto, cuidado obsessivo com cada detalhe e a coragem de construir do zero um CRM pensado para equipes que querem vender mais com menos trabalho manual.`,
    portraitSrc: '/images/founders/daniel-lucas.webp',
  },
];
