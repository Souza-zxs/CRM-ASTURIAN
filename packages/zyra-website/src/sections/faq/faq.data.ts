import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';

export type FaqQuestion = {
  question: MessageDescriptor;
  answer: MessageDescriptor;
};

export const FAQ_QUESTIONS: readonly FaqQuestion[] = [
  {
    question: msg`Posso rodar o Zyra na minha própria infraestrutura?`,
    answer: msg`Sim. Você pode auto-hospedar o Zyra e manter controle total sobre seus dados e sua infraestrutura, sem depender de nuvem de terceiros.`,
  },
  {
    question: msg`Quanto tempo leva pra colocar o Zyra no ar?`,
    answer: msg`Depende do tamanho da operação, mas o setup inicial é rápido — em poucos dias o seu time já consegue estar usando o Zyra no dia a dia.`,
  },
  {
    question: msg`Dá pra migrar do Salesforce ou do HubSpot?`,
    answer: msg`Sim. Você pode importar seus dados via CSV ou usar nossa API para bases maiores.`,
  },
  {
    question: msg`Preciso de um desenvolvedor pra customizar o Zyra?`,
    answer: msg`Não. Dá pra criar objetos, campos, views e automações sem código, direto nas configurações — sem limite e sem custo extra.`,
  },
  {
    question: msg`Desenvolvedores conseguem estender o Zyra com código?`,
    answer: msg`Sim, com o nosso framework de Apps. Crie uma extensão com \`npx create-zyra-app\` e publique objetos customizados, funções server-side, componentes React que renderizam dentro da interface do Zyra, skills e agentes de IA, views e navegação — tudo em TypeScript, com deploy pra qualquer workspace.`,
  },
  {
    question: msg`O Zyra funciona com Claude, ChatGPT e Cursor?`,
    answer: msg`Sim. Todo workspace conta com um servidor MCP nativo. Conecte seu assistente de IA via OAuth e ele consegue ler e escrever dados do CRM em linguagem natural.`,
  },
  {
    question: msg`Quanto custa o Zyra?`,
    answer: msg`Os planos variam conforme o tamanho do time e as necessidades da operação. Fale com a gente pra montar uma proposta sob medida.`,
  },
];
