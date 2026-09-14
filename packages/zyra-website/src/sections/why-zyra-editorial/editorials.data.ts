import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';

export type WhyZyraEditorial = {
  align: 'left' | 'right';
  eyebrow: MessageDescriptor;
  heading: MessageDescriptor;
  id: string;
  paragraphs: readonly [MessageDescriptor, MessageDescriptor];
};

export const WHY_ZYRA_EDITORIALS: readonly WhyZyraEditorial[] = [
  {
    align: 'left',
    eyebrow: msg`A virada`,
    heading: msg`CRM era um livro-caixa. *A IA transformou isso num sistema operacional.*`,
    id: 'shift',
    paragraphs: [
      msg`Por vinte anos, CRM significou sempre a mesma coisa: um lugar pra registrar ligações, acompanhar negócios e tirar relatórios na sexta-feira. O trabalho de verdade acontecia na cabeça das pessoas, em threads do Slack, em conversas de corredor. O CRM só marcava o placar. Ninguém esperava mais do que isso.`,
      msg`Agentes de IA estão começando a rascunhar prospecção, pontuar leads, pesquisar contas, escrever follow-ups, atualizar estágios de negócio. Cada uma dessas ações lê e escreve no CRM. O placar virou o playbook. O banco de dados virou o cérebro.`,
    ],
  },
  {
    align: 'right',
    eyebrow: msg`O que isso significa`,
    heading: msg`Diferenciação agora *mora no código que você é dono.*`,
    id: 'meaning',
    paragraphs: [
      msg`Você não compra seu pipeline de deploy pronto. Você não aluga seu data warehouse de um fornecedor que decide o schema. Você constrói, você é dono, você itera toda semana. O CRM está indo pelo mesmo caminho. Os times que tratarem isso como infraestrutura própria vão acumular vantagem a cada trimestre.`,
      msg`Na terça seu time descobre que negócios com um patrocinador técnico fecham 3x mais rápido. Na quarta você adiciona o campo, liga a pontuação, ajusta o workflow. Na quinta seus agentes já estão agindo em cima disso. Esse ciclo de feedback é a vantagem. E só funciona se o CRM for seu.`,
    ],
  },
  {
    align: 'left',
    eyebrow: msg`A oportunidade`,
    heading: msg`Construa numa tarde. *A IA deixou essa distância pequena assim.*`,
    id: 'opportunity',
    paragraphs: [
      msg`Um ano atrás, customizar seu CRM significava contratar um consultor de Salesforce, aprender Apex, esperar meses. A distância entre "eu quero isso" e "está no ar" era medida em trimestres e faturas. Então as pessoas se conformavam. Elas dobravam o processo pra caber na ferramenta e chamavam isso de adoção.`,
      msg`Agora um desenvolvedor pode descrever o que quer pro Claude Code e ter um app funcionando numa tarde. Um objeto customizado, um workflow de pontuação, uma view nova, uma integração. O gargalo não é mais construir. É se a sua plataforma deixa.`,
    ],
  },
];
