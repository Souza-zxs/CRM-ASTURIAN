import { msg } from '@lingui/core/macro';

import { type PlanTableDataType } from './plan-table-types';

export const PLAN_TABLE_DATA: PlanTableDataType = {
  featureColumnLabel: msg`Nome`,
  initialVisibleRowCount: 15,
  rows: [
    {
      featureLabel: msg`Preço`,
      tiers: {
        organization: { kind: 'text', text: msg`Sob consulta` },
        pro: { kind: 'text', text: msg`R$120` },
      },
      type: 'row',
    },
    {
      featureLabel: msg`Limite de usuários`,
      tiers: {
        organization: { kind: 'text', text: msg`Ilimitado` },
        pro: { kind: 'text', text: msg`Ilimitado` },
      },
      type: 'row',
    },
    { title: msg`Workspace`, type: 'category' },
    {
      featureLabel: msg`Objetos customizados`,
      tiers: {
        organization: { kind: 'text', text: msg`Ilimitado` },
        pro: { kind: 'text', text: msg`Ilimitado` },
      },
      type: 'row',
    },
    {
      featureLabel: msg`Campos customizados`,
      tiers: {
        organization: { kind: 'text', text: msg`Ilimitado` },
        pro: { kind: 'text', text: msg`Ilimitado` },
      },
      type: 'row',
    },
    {
      featureLabel: msg`Views customizadas`,
      tiers: {
        organization: { kind: 'text', text: msg`Ilimitado` },
        pro: { kind: 'text', text: msg`Ilimitado` },
      },
      type: 'row',
    },
    {
      featureLabel: msg`Tipos de view`,
      tiers: {
        organization: { kind: 'text', text: msg`Tabela, Kanban, Calendário` },
        pro: { kind: 'text', text: msg`Tabela, Kanban, Calendário` },
      },
      type: 'row',
    },
    {
      featureLabel: msg`Layout customizado`,
      tiers: {
        organization: { kind: 'text', text: msg`Ilimitado` },
        pro: { kind: 'text', text: msg`Ilimitado` },
      },
      type: 'row',
    },
    {
      featureLabel: msg`Registros`,
      tiers: {
        organization: { kind: 'text', text: msg`Ilimitado` },
        pro: { kind: 'text', text: msg`Ilimitado` },
      },
      type: 'row',
    },
    {
      featureLabel: msg`Importação e exportação de CSV`,
      tiers: {
        organization: { kind: 'yes', label: msg`Sim` },
        pro: { kind: 'yes', label: msg`Sim` },
      },
      type: 'row',
    },
    {
      featureLabel: msg`Idiomas`,
      tiers: {
        organization: { kind: 'text', text: msg`30+` },
        pro: { kind: 'text', text: msg`30+` },
      },
      type: 'row',
    },
    { title: msg`Relatórios`, type: 'category' },
    {
      featureLabel: msg`Número de dashboards`,
      tiers: {
        organization: { kind: 'text', text: msg`Ilimitado` },
        pro: { kind: 'text', text: msg`Ilimitado` },
      },
      type: 'row',
    },
    { title: msg`E-mails e Calendário`, type: 'category' },
    {
      featureLabel: msg`Contas de e-mail por usuário`,
      tiers: {
        organization: { kind: 'text', text: msg`Ilimitado` },
        pro: { kind: 'text', text: msg`Ilimitado` },
      },
      type: 'row',
    },
    {
      featureLabel: msg`Importação de pastas/etiquetas`,
      tiers: {
        organization: { kind: 'yes', label: msg`Sim` },
        pro: { kind: 'yes', label: msg`Sim` },
      },
      type: 'row',
    },
    {
      featureLabel: msg`Compartilhamento de e-mail`,
      tiers: {
        organization: { kind: 'text', text: msg`Totalmente customizável` },
        pro: { kind: 'text', text: msg`Totalmente customizável` },
      },
      type: 'row',
    },
    { title: msg`IA e Automações`, type: 'category' },
    {
      featureLabel: msg`Workflows`,
      tiers: {
        organization: { kind: 'yes', label: msg`Sim` },
        pro: { kind: 'yes', label: msg`Sim` },
      },
      type: 'row',
    },
    {
      featureLabel: msg`Agentes de IA`,
      tiers: {
        organization: { kind: 'yes', label: msg`Sim` },
        pro: { kind: 'yes', label: msg`Sim` },
      },
      type: 'row',
    },
    { title: msg`Segurança`, type: 'category' },
    {
      featureLabel: msg`Autenticação de dois fatores`,
      tiers: {
        organization: { kind: 'yes', label: msg`Sim` },
        pro: { kind: 'yes', label: msg`Sim` },
      },
      type: 'row',
    },
    {
      featureLabel: msg`Papéis de usuário`,
      tiers: {
        organization: { kind: 'text', text: msg`Ilimitado` },
        pro: { kind: 'text', text: msg`Ilimitado` },
      },
      type: 'row',
    },
    {
      featureLabel: msg`Permissões de leitura/edição/exclusão`,
      tiers: {
        organization: { kind: 'text', text: msg`Ilimitado` },
        pro: { kind: 'text', text: msg`Ilimitado` },
      },
      type: 'row',
    },
    {
      featureLabel: msg`Permissões por campo`,
      tiers: {
        organization: { kind: 'text', text: msg`Ilimitado` },
        pro: { kind: 'text', text: msg`Ilimitado` },
      },
      type: 'row',
    },
    {
      featureLabel: msg`Permissões por linha`,
      tiers: {
        organization: { kind: 'text', text: msg`Ilimitado` },
        pro: { kind: 'dash' },
      },
      type: 'row',
    },
    {
      featureLabel: msg`SSO`,
      tiers: {
        organization: { kind: 'yes', label: msg`Sim` },
        pro: { kind: 'dash' },
      },
      type: 'row',
    },
    {
      featureLabel: msg`Rotação de chave de criptografia`,
      tiers: {
        organization: { kind: 'yes', label: msg`Sim` },
        pro: { kind: 'dash' },
      },
      type: 'row',
    },
    {
      featureLabel: msg`Logs de auditoria`,
      tiers: {
        organization: { kind: 'yes', label: msg`Sim` },
        pro: { kind: 'dash' },
      },
      type: 'row',
    },
    {
      featureLabel: msg`Ambientes`,
      tiers: {
        organization: { kind: 'text', text: msg`Local, Produção` },
        pro: { kind: 'text', text: msg`Local, Produção` },
      },
      type: 'row',
    },
    {
      featureLabel: msg`Personificar usuários`,
      tiers: {
        organization: { kind: 'yes', label: msg`Sim` },
        pro: { kind: 'yes', label: msg`Sim` },
      },
      type: 'row',
    },
    { title: msg`Suporte`, type: 'category' },
    {
      featureLabel: msg`Comunidade`,
      tiers: {
        organization: { kind: 'yes', label: msg`Sim` },
        pro: { kind: 'yes', label: msg`Sim` },
      },
      type: 'row',
    },
    {
      featureLabel: msg`Central de ajuda`,
      tiers: {
        organization: { kind: 'yes', label: msg`Sim` },
        pro: { kind: 'yes', label: msg`Sim` },
      },
      type: 'row',
    },
    {
      featureLabel: msg`E-mail e Chat`,
      tiers: {
        organization: { kind: 'yes', label: msg`Sim` },
        pro: { kind: 'yes', label: msg`Sim` },
      },
      type: 'row',
    },
    {
      featureLabel: msg`Suporte prioritário`,
      tiers: {
        organization: { kind: 'yes', label: msg`Sim` },
        pro: { kind: 'dash' },
      },
      type: 'row',
    },
    {
      featureLabel: msg`Pacotes de onboarding`,
      tiers: {
        organization: { kind: 'yes', label: msg`Sim` },
        pro: { kind: 'yes', label: msg`Sim` },
      },
      type: 'row',
    },
    {
      featureLabel: msg`Parceiros de implementação`,
      tiers: {
        organization: { kind: 'yes', label: msg`Sim` },
        pro: { kind: 'dash' },
      },
      type: 'row',
    },
    { title: msg`Customização`, type: 'category' },
    {
      featureLabel: msg`Apps customizados`,
      tiers: {
        organization: { kind: 'text', text: msg`Ilimitado` },
        pro: { kind: 'text', text: msg`Ilimitado` },
      },
      type: 'row',
    },
    {
      featureLabel: msg`Subdomínio (suaempresa.zyra.com)`,
      tiers: {
        organization: { kind: 'yes', label: msg`Sim` },
        pro: { kind: 'yes', label: msg`Sim` },
      },
      type: 'row',
    },
    {
      featureLabel: msg`Domínio próprio (crm.suaempresa.com)`,
      tiers: {
        organization: { kind: 'yes', label: msg`Sim` },
        pro: { kind: 'dash' },
      },
      type: 'row',
    },
    { title: msg`Desenvolvedores`, type: 'category' },
    {
      featureLabel: msg`API REST e GraphQL`,
      tiers: {
        organization: { kind: 'yes', label: msg`Sim` },
        pro: { kind: 'yes', label: msg`Sim` },
      },
      type: 'row',
    },
    {
      featureLabel: msg`Webhooks`,
      tiers: {
        organization: { kind: 'yes', label: msg`Sim` },
        pro: { kind: 'yes', label: msg`Sim` },
      },
      type: 'row',
    },
    {
      featureLabel: msg`Servidor MCP`,
      tiers: {
        organization: { kind: 'yes', label: msg`Sim` },
        pro: { kind: 'yes', label: msg`Sim` },
      },
      type: 'row',
    },
    {
      featureLabel: msg`Instalar app via tarball`,
      tiers: {
        organization: { kind: 'yes', label: msg`Sim` },
        pro: { kind: 'dash' },
      },
      type: 'row',
    },
    {
      featureLabel: msg`Chamadas de API`,
      tiers: {
        organization: { kind: 'text', text: msg`100 por minuto` },
        pro: { kind: 'text', text: msg`50 por minuto` },
      },
      type: 'row',
    },
  ],
  seeMoreFeaturesCta: {
    collapseLabel: msg`Mostrar menos`,
    expandLabel: msg`Ver mais recursos`,
  },
  tierColumns: [
    { id: 'pro', label: msg`Pro` },
    { id: 'organization', label: msg`Organization` },
  ],
};
