import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';

export type PlansBillingPeriod = 'monthly' | 'yearly';
export type PlansTierId = 'organization' | 'pro';

export type PlanPrice =
  | {
      kind: 'numeric';
      prefix: string;
      suffix: MessageDescriptor;
      value: number;
    }
  | {
      kind: 'custom';
      label: MessageDescriptor;
    };

type PlansTierCell = {
  featureBullets: MessageDescriptor[];
  price: PlanPrice;
};

type PlansTier = {
  cells: Record<PlansBillingPeriod, PlansTierCell>;
  heading: MessageDescriptor;
  icon: { alt: string; src: string; widthPx?: number };
};

const PRO_BULLETS_MONTHLY = [
  msg`Customização completa`,
  msg`Crie apps customizados`,
  msg`Agentes de IA com skills customizadas`,
  msg`5 créditos de workflow/mês incluídos`,
  msg`Suporte padrão`,
];

const PRO_BULLETS_YEARLY = [
  msg`Customização completa`,
  msg`Crie apps customizados`,
  msg`Agentes de IA com skills customizadas`,
  msg`50 créditos de workflow/ano incluídos`,
  msg`Suporte padrão`,
];

const ORGANIZATION_BULLETS_CLOUD = [
  msg`Tudo do Pro`,
  msg`Permissões por linha`,
  msg`SSO via SAML/OIDC`,
  msg`Domínio próprio`,
  msg`Suporte prioritário`,
];

export const PLANS_DATA: Record<PlansTierId, PlansTier> = {
  organization: {
    cells: {
      monthly: {
        featureBullets: ORGANIZATION_BULLETS_CLOUD,
        price: { kind: 'custom', label: msg`Sob consulta` },
      },
      yearly: {
        featureBullets: ORGANIZATION_BULLETS_CLOUD,
        price: { kind: 'custom', label: msg`Sob consulta` },
      },
    },
    heading: msg`Organization`,
    icon: {
      alt: 'Organization plan icon',
      src: '/images/pricing/plans/organization-icon.webp',
    },
  },
  pro: {
    cells: {
      monthly: {
        featureBullets: PRO_BULLETS_MONTHLY,
        price: {
          kind: 'numeric',
          value: 120,
          prefix: 'R$',
          suffix: msg`/usuário/mês`,
        },
      },
      yearly: {
        featureBullets: PRO_BULLETS_YEARLY,
        price: {
          kind: 'numeric',
          value: 597,
          prefix: 'R$',
          suffix: msg`/usuário/ano`,
        },
      },
    },
    heading: msg`Pro`,
    icon: {
      alt: 'Pro plan icon',
      src: '/images/pricing/plans/pro-icon.webp',
      widthPx: 60,
    },
  },
};
