import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import {
  IconBook,
  IconBrandLinkedin,
  IconBrandX,
  IconCode,
  IconTag,
  IconUsers,
} from '@tabler/icons-react';
import { type IconComponent } from '@/icons';
import { LATEST_RELEASE } from '@/platform/releases';
import { SITE_URLS } from '@/platform/site-urls';

export type MenuNavChildPreview = {
  image: string;
  imageAlt: MessageDescriptor;
  imagePosition?: string;
  imageScale?: number;
  title: MessageDescriptor;
  description: MessageDescriptor;
};

export type MenuNavChild = {
  label: MessageDescriptor;
  description: MessageDescriptor;
  href: string;
  external?: boolean;
  icon: IconComponent;
  preview: MenuNavChildPreview;
};

export type MenuNavItem = {
  label: MessageDescriptor;
  href?: string;
  children?: readonly MenuNavChild[];
};

export type MenuSocialLink = {
  ariaLabel: MessageDescriptor;
  href: string;
  icon: IconComponent;
  showInDesktop: boolean;
};

export const MENU: {
  appLoginUrl: string;
  appSignUpUrl: string;
  navItems: readonly MenuNavItem[];
  socialLinks: readonly MenuSocialLink[];
} = {
  appLoginUrl: SITE_URLS.appLogin,
  appSignUpUrl: SITE_URLS.appSignUp,
  navItems: [
    { href: '/why-zyra', label: msg`Por que a Zyra` },
    {
      label: msg`Recursos`,
      children: [
        {
          label: msg`Guia do usuário`,
          description: msg`Aprenda a usar a Zyra`,
          href: SITE_URLS.docsUserGuide,
          external: true,
          icon: IconBook,
          preview: {
            image: '/images/menu/user-guide.webp',
            imageAlt: msg`Prévia do guia do usuário da Zyra`,
            title: msg`Domine cada detalhe da Zyra`,
            description: msg`Guias passo a passo e manuais para ajudar seu time a aproveitar ao máximo o workspace.`,
          },
        },
        {
          label: msg`Desenvolvedores`,
          description: msg`Crie aplicativos na Zyra`,
          href: SITE_URLS.docsDevelopers,
          external: true,
          icon: IconCode,
          preview: {
            image: '/images/menu/developers.webp',
            imageAlt: msg`Ilustração azul de desenvolvedor com setas ramificadas`,
            imagePosition: 'center',
            imageScale: 1.6,
            title: msg`Construa em uma plataforma aberta`,
            description: msg`APIs, SDKs e webhooks para estender a Zyra e lançar aplicativos sobre os dados do seu CRM.`,
          },
        },
        {
          label: msg`Parceiros`,
          description: msg`Encontre um parceiro Zyra`,
          href: '/partners',
          icon: IconUsers,
          preview: {
            image: '/images/menu/partners.webp',
            imageAlt: msg`Ecossistema de parceiros Zyra`,
            imagePosition: 'center',
            title: msg`Trabalhe com um especialista Zyra`,
            description: msg`Conheça as agências e consultores certificados que implementam a Zyra para equipes no mundo todo.`,
          },
        },
        {
          label: msg`Lançamentos`,
          description: msg`Descubra as novidades`,
          href: '/releases',
          icon: IconTag,
          preview: {
            image: LATEST_RELEASE.previewImage,
            imageAlt: msg`Lançamentos da Zyra — ${LATEST_RELEASE.title}`,
            imageScale: 1.04,
            title: msg`${LATEST_RELEASE.title}`,
            description: msg`Acompanhe cada lançamento com changelogs, destaques e demonstrações dos recursos mais novos.`,
          },
        },
      ],
    },
    { href: '/customers', label: msg`Clientes` },
    { href: '/pricing', label: msg`Preços` },
  ],
  socialLinks: [
    {
      ariaLabel: msg`LinkedIn (abre em nova aba)`,
      href: SITE_URLS.linkedin,
      icon: IconBrandLinkedin,
      showInDesktop: false,
    },
    {
      ariaLabel: msg`X (abre em nova aba)`,
      href: SITE_URLS.x,
      icon: IconBrandX,
      showInDesktop: false,
    },
  ],
};
