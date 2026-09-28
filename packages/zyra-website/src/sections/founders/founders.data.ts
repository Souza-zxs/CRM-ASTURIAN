import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';

export type FounderRecord = {
  bio: MessageDescriptor;
  designation: MessageDescriptor;
  name: MessageDescriptor;
  // Founders without a photo yet render their initials in the portrait frame.
  portraitSrc?: string;
};

export const FOUNDERS: readonly FounderRecord[] = [
  {
    name: msg`Daniel Lucas Souza`,
    designation: msg`CEO e fundador, Horizon`,
    bio: msg`Daniel imaginou o Zyra e o levou de uma ideia a um produto completo. Como CEO da Horizon, une visão de produto, cuidado obsessivo com cada detalhe e a coragem de construir do zero um CRM pensado para equipes que querem vender mais com menos trabalho manual.`,
    portraitSrc: '/images/founders/daniel-lucas.webp',
  },
  {
    name: msg`Thulio Leal`,
    designation: msg`COO e cofundador, Horizon`,
    bio: msg`Thulio é cofundador e COO da Horizon e contribuiu diretamente para o desenvolvimento do Zyra. Cuida para que a operação da empresa acompanhe a qualidade do produto, do primeiro contato à implementação na sua equipe.`,
    portraitSrc: '/images/founders/thulio-leal.webp',
  },
  {
    name: msg`Rodrigo Asturian`,
    designation: msg`Parceiro da Horizon e sócio do Zyra`,
    bio: msg`Rodrigo Asturian é advogado e CEO da Asturian Associates, escritório internacional de advocacia especializado em proteção patrimonial e internacionalização de empresas. Parceiro da Horizon, é um dos donos do Zyra.`,
    portraitSrc: '/images/founders/rodrigo-asturian.webp',
  },
];
