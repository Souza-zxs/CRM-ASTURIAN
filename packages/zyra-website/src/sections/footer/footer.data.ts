import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';

import { type IconComponent } from '@/icons';
import { SITE_URLS } from '@/platform/site-urls';

import { IconBrandLinkedin, IconBrandX } from '@tabler/icons-react';

export type FooterNavLink = {
  label: MessageDescriptor;
  href: string;
  external?: boolean;
};

export type FooterCta =
  | {
      kind: 'contact-modal';
      label: MessageDescriptor;
      variant: 'filled' | 'outlined';
    }
  | {
      kind: 'link';
      label: MessageDescriptor;
      href: string;
      variant: 'filled' | 'outlined';
    };

export type FooterNavGroup = {
  id: string;
  title: MessageDescriptor;
  links: readonly FooterNavLink[];
  ctas?: readonly FooterCta[];
};

export type FooterSocialLink = {
  ariaLabel: MessageDescriptor;
  href: string;
  icon: IconComponent;
};

// Sitemap includes Customers — it exists in the nav but was missing from the
// old footer.
export const FOOTER: {
  navGroups: readonly FooterNavGroup[];
  socialLinks: readonly FooterSocialLink[];
} = {
  navGroups: [
    {
      id: 'footer-sitemap',
      title: msg`Mapa do site`,
      links: [
        { label: msg`Início`, href: '/' },
        { label: msg`Preços`, href: '/pricing' },
        { label: msg`Clientes`, href: '/customers' },
        { label: msg`Parceiros`, href: '/partners' },
        { label: msg`Por que a Zyra`, href: '/why-zyra' },
      ],
    },
    {
      id: 'footer-help',
      title: msg`Ajuda`,
      links: [
        {
          label: msg`Desenvolvedores`,
          href: SITE_URLS.docsDevelopers,
          external: true,
        },
        {
          label: msg`Guia do usuário`,
          href: SITE_URLS.docsGettingStarted,
          external: true,
        },
        { label: msg`Notas de versão`, href: '/releases' },
        { label: msg`Gerador de halftone`, href: '/halftone' },
      ],
    },
    {
      id: 'footer-legal',
      title: msg`Jurídico`,
      links: [
        { label: msg`Política de Privacidade`, href: '/privacy-policy' },
        { label: msg`Termos e Condições`, href: '/terms' },
        {
          label: msg`Central de Confiança`,
          href: SITE_URLS.trustCenter,
          external: true,
        },
      ],
    },
    {
      id: 'footer-connect',
      title: msg`Conecte-se`,
      links: [
        {
          label: msg`LinkedIn`,
          href: SITE_URLS.linkedin,
          external: true,
        },
      ],
      ctas: [
        {
          kind: 'contact-modal',
          label: msg`Fale conosco`,
          variant: 'filled',
        },
        {
          kind: 'link',
          label: msg`Começar agora`,
          href: SITE_URLS.appSignUp,
          variant: 'outlined',
        },
      ],
    },
  ],
  socialLinks: [
    {
      ariaLabel: msg`LinkedIn (abre em nova aba)`,
      href: SITE_URLS.linkedin,
      icon: IconBrandLinkedin,
    },
    {
      ariaLabel: msg`X (abre em nova aba)`,
      href: SITE_URLS.x,
      icon: IconBrandX,
    },
  ],
};
