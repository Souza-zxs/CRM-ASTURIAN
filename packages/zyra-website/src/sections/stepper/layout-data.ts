import { type PRODUCT_STEPPER_SCENE } from '@/tokens/feature-scenes/product-stepper-scene';

import {
  type LayoutFieldIconType,
  type LayoutNavIconType,
} from './LayoutIcons';

type NavTint = keyof typeof PRODUCT_STEPPER_SCENE.navTints;

export type LayoutFieldDefinition = {
  icon: LayoutFieldIconType;
  id: string;
  label: string;
  section: string;
  type: string;
  visible: boolean;
};

export type LayoutNavItemDefinition = {
  background: NavTint;
  children?: { background: NavTint; icon: LayoutNavIconType; label: string }[];
  icon: LayoutNavIconType;
  isActive: boolean;
  isFolder?: boolean;
  label: string;
  suffix?: string;
};

// Mock fiction layout editor content (product-screenshot copy, English).
export const LAYOUT_EDITOR_CONTENT: {
  fields: LayoutFieldDefinition[];
  navItems: LayoutNavItemDefinition[];
} = {
  fields: [
    {
      id: 'url',
      icon: 'link',
      label: 'URL',
      type: 'Link',
      section: 'Geral',
      visible: true,
    },
    {
      id: 'account-owner',
      icon: 'user',
      label: 'Responsável pela conta',
      type: 'Relação',
      section: 'Geral',
      visible: true,
    },
    {
      id: 'revenue',
      icon: 'money',
      label: 'Receita',
      type: 'Moeda',
      section: 'Geral',
      visible: true,
    },
    {
      id: 'icp',
      icon: 'target',
      label: 'ICP',
      type: 'Booleano',
      section: 'Adicional',
      visible: false,
    },
    {
      id: 'employees',
      icon: 'users',
      label: 'Funcionários',
      type: 'Número',
      section: 'Outros',
      visible: true,
    },
    {
      id: 'address',
      icon: 'map',
      label: 'Endereço',
      type: 'Endereço',
      section: 'Outros',
      visible: true,
    },
    {
      id: 'creation-date',
      icon: 'calendar',
      label: 'Data de criação',
      type: 'Data e hora',
      section: 'Outros',
      visible: true,
    },
  ],
  navItems: [
    {
      icon: 'building',
      label: 'Empresas',
      isActive: true,
      background: 'indigo',
    },
    { icon: 'user', label: 'Pessoas', isActive: false, background: 'indigo' },
    {
      icon: 'target',
      label: 'Oportunidades',
      isActive: false,
      background: 'red',
    },
    {
      icon: 'checkbox',
      label: 'Tarefas',
      isActive: false,
      background: 'teal',
    },
    { icon: 'notes', label: 'Notas', isActive: false, background: 'teal' },
    {
      icon: 'letterS',
      label: 'Dashboard de vendas',
      isActive: false,
      background: 'yellow',
      suffix: 'Dashboard',
    },
    {
      icon: 'automation',
      label: 'Workflows',
      isActive: false,
      background: 'peach',
      isFolder: true,
      children: [
        { icon: 'automation', label: 'Workflows', background: 'gray' },
        { icon: 'play', label: 'Execuções de workflows', background: 'gray' },
        {
          icon: 'versions',
          label: 'Versões de workflows',
          background: 'gray',
        },
      ],
    },
    { icon: 'ai', label: 'Claude', isActive: false, background: 'gray' },
    {
      icon: 'stripeS',
      label: 'Stripe',
      isActive: false,
      background: 'gray',
      isFolder: true,
    },
  ],
};
