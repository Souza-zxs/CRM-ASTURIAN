import { msg } from '@lingui/core/macro';

import { type SalesfarceDataType } from './salesfarce-types';

const SALESFARCE_POPUP_TITLE = msg`Boa escolha!`;

export const SALESFARCE_DATA: SalesfarceDataType = {
  body: msg`Tem quem chame isso de preço enterprise. Nós preferimos um CRM em que acesso à API, webhooks e workflows não aparecem como add-on surpresa.`,
  pricing: {
    addons: [
      {
        cost: 35,
        id: 'api-access',
        label: msg`Acesso à API`,
        popup: {
          body: msg`APIs são à parte. Simplicidade tem seu preço.`,
          titleBar: SALESFARCE_POPUP_TITLE,
        },
        rightLabel: msg`+R$35/usuário por mês`,
      },
      {
        cost: 0,
        fixedCost: 7000,
        id: 'webhooks',
        label: msg`Webhooks (Change Data Capture)`,
        popup: {
          body: msg`Mudanças em tempo real? Isso vai ser uma surpresa premium.`,
          titleBar: SALESFARCE_POPUP_TITLE,
        },
        rightLabel: msg`+R$7000/org por mês`,
      },
      {
        cost: 0,
        disabled: true,
        id: 'live-updates',
        label: msg`Atualizações em tempo real`,
        popup: {
          body: msg`Atualizações em tempo real estão indisponíveis, o que é quase mais honesto.`,
          titleBar: SALESFARCE_POPUP_TITLE,
        },
        rightLabel: msg`Indisponível`,
        tooltip: {
          body: msg`Tempo real é um estado de espírito, não um recurso.`,
          title: msg`Indisponível`,
        },
      },
      {
        cost: 0,
        defaultChecked: true,
        disabled: true,
        id: 'ui-theme',
        label: msg`Tema da interface`,
        popup: {
          body: msg`Um tema retrô como add-on pago é de alguma forma a parte mais acreditável.`,
          titleBar: SALESFARCE_POPUP_TITLE,
        },
        rightLabel: msg`Retrô 2015`,
        tooltip: {
          body: msg`Melhor que Liquid Glass!`,
          title: msg`Incluso!`,
        },
      },
      {
        cost: 5,
        id: 'sso',
        label: msg`SSO`,
        popup: {
          body: msg`Só R$5 pelo SSO. Praticamente um programa de caridade.`,
          titleBar: SALESFARCE_POPUP_TITLE,
        },
        rightLabel: msg`+R$5/usuário por mês`,
      },
      {
        cost: 75,
        id: 'permissions',
        label: msg`11 grupos de\npermissão`,
        popup: {
          body: msg`Experimente a granularidade enterprise, começando com a 11ª permissão.`,
          titleBar: SALESFARCE_POPUP_TITLE,
        },
        rightLabel: msg`+R$75/usuário por mês\nMigre para o enterprise!`,
        sharedCostKey: 'enterprise-plan',
      },
      {
        cost: 105,
        id: 'maps',
        label: msg`Visualização em mapa`,
        popup: {
          body: msg`Visualize seus clientes num mapa!`,
          titleBar: SALESFARCE_POPUP_TITLE,
        },
        rightLabel: msg`+R$105/usuário por mês`,
      },
      {
        cost: 75,
        id: 'workflows',
        label: msg`6 workflows`,
        popup: {
          body: msg`Comece a automatizar em grande escala!`,
          titleBar: SALESFARCE_POPUP_TITLE,
        },
        rightLabel: msg`+R$75/usuário por mês\nMigre para o enterprise!`,
        sharedCostKey: 'enterprise-plan',
      },
      {
        cost: 0,
        id: 'lock-in',
        label: msg`Fidelização`,
        popup: {
          body: msg`Eles chamam de lealdade do cliente. Nós chamamos de jaula bem carinhosa.`,
          titleBar: SALESFARCE_POPUP_TITLE,
        },
        rightLabel: msg`3 2 anos de contrato\n-33% off`,
        rightLabelParts: [
          [
            { strike: true, text: msg`3` },
            { text: msg`2 anos de contrato` },
          ],
          [{ text: msg`-33% off` }],
        ],
      },
      {
        cost: 0,
        defaultChecked: true,
        disabled: true,
        id: 'apex-tutorials',
        label: msg`Tutoriais APEX`,
        popup: {
          body: msg`Até o material de treinamento é um recurso digno de comemoração.`,
          titleBar: SALESFARCE_POPUP_TITLE,
        },
        rightLabel: msg`Grátis pra você!`,
        tooltip: {
          body: msg`Disponível no YouTube!`,
          title: msg`Incluso!`,
        },
      },
      {
        cost: 0,
        defaultChecked: true,
        disabled: true,
        id: 'salesfarce-classic',
        label: msg`Salesfarce Classic`,
        popup: {
          body: msg`Clássico nunca morre. Só ganha mais uma prorrogação.`,
          titleBar: SALESFARCE_POPUP_TITLE,
        },
        rightLabel: msg`Prorrogado!`,
        tooltip: {
          body: msg`Sobreviveu a todo redesign desde 2004.`,
          title: msg`Incluso!`,
        },
      },
      {
        cost: 75,
        id: 'flow-orchestration',
        label: msg`Orquestração\nde flows`,
        popup: {
          body: msg`Porque orquestração de verdade é botar um cifrão em cada entrada dramática.`,
          titleBar: SALESFARCE_POPUP_TITLE,
        },
        rightLabel: msg`R$1/execução de orquestração/org\n+R$75/usuário por mês\nMigre para o enterprise!`,
        sharedCostKey: 'enterprise-plan',
      },
      {
        cost: 0,
        disabled: true,
        id: 'infinite-scroll',
        label: msg`Scroll infinito`,
        popup: {
          body: msg`Scroll infinito ainda está a caminho, ao contrário da fatura.`,
          titleBar: SALESFARCE_POPUP_TITLE,
        },
        rightLabel: msg`Em breve!`,
        tooltip: {
          body: msg`Paginação constrói caráter.`,
          title: msg`Em breve!`,
        },
      },
      {
        cost: 75,
        id: 'ai-einstein',
        label: msg`IA (Einstein)`,
        popup: {
          body: msg`vire um gênio!`,
          titleBar: SALESFARCE_POPUP_TITLE,
        },
        rightLabel: msg`+R$75/usuário por mês\nMigre para o enterprise!`,
        sharedCostKey: 'enterprise-plan',
      },
      {
        cost: 75,
        id: 'encrypt-data',
        label: msg`Criptografe seus dados`,
        netSpendRate: 0.2,
        popup: {
          body: msg`Porque, aparentemente, privacidade fica mais premium com sobretaxa.`,
          titleBar: SALESFARCE_POPUP_TITLE,
        },
        rightLabel: msg`+20% do gasto líquido\n+R$75/usuário por mês\nMigre para o enterprise!`,
        sharedCostKey: 'enterprise-plan',
      },
    ],
    basePriceAmount: 100,
    featureSectionHeading: msg`Add-ons`,
    priceSuffix: msg`/ assento / mês - cobrado anualmente`,
    productIconAlt: 'Retro help document icon',
    productIconSrc: '/images/pricing/salesfarce/help-icon.webp',
    productTitle: msg`Salesfarce Pro`,
    promoTag: msg`0800‑SIM‑SOFTWARE`,
    secondaryCtaHref:
      'https://www.salesforce.com/en-us/wp-content/uploads/sites/4/documents/pricing/all-add-ons.pdf',
    secondaryCtaLabel: msg`Ver mais add-ons`,
    secondaryCtaNote: msg`Mais opções disponíveis!`,
    totalPriceLabel: msg`total por mês com custo fixo`,
    windowTitle: msg`Central de Add-ons Salesfarce`,
  },
};
