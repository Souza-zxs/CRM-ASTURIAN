import { type PRODUCT_STEPPER_SCENE } from '@/tokens/feature-scenes/product-stepper-scene';

import {
  type DataModelFieldIcon,
  type DataModelHeaderIcon,
} from './DataModelIcons';

export type EntityTone = keyof typeof PRODUCT_STEPPER_SCENE.entityTones;

export type EntityDefinition = {
  expandCount: number;
  fields: { icon: DataModelFieldIcon; label: string }[];
  headerIcon: DataModelHeaderIcon;
  id: string;
  isCustom: boolean;
  label: string;
  meta: string;
  tone: EntityTone;
  x: number;
  y: number;
};

export type EntityConnection = {
  from: string;
  to: string;
};

// Mock fiction entity graph (product-screenshot copy, English).
export const DATA_MODEL_GRAPH: {
  connections: EntityConnection[];
  entities: EntityDefinition[];
} = {
  entities: [
    {
      id: 'workspaces',
      label: 'Espaços de trabalho',
      meta: '22',
      isCustom: true,
      headerIcon: 'userScreenSmall',
      tone: 'green',
      fields: [
        { icon: 'building', label: 'Empresa' },
        { icon: 'user', label: 'Usuários' },
      ],
      expandCount: 21,
      x: 40,
      y: 40,
    },
    {
      id: 'companies',
      label: 'Empresas',
      meta: '39',
      isCustom: false,
      headerIcon: 'buildingSmall',
      tone: 'indigo',
      fields: [
        { icon: 'apps', label: 'Espaço de trabalho' },
        { icon: 'tag', label: '31 campos' },
      ],
      expandCount: 8,
      x: 290,
      y: 20,
    },
    {
      id: 'users',
      label: 'Usuários',
      meta: '497',
      isCustom: true,
      headerIcon: 'usersSmall',
      tone: 'purple',
      fields: [
        { icon: 'user', label: 'Pessoas' },
        { icon: 'apps', label: 'Espaço de trabalho' },
      ],
      expandCount: 32,
      x: 40,
      y: 310,
    },
    {
      id: 'people',
      label: 'Pessoas',
      meta: '648',
      isCustom: false,
      headerIcon: 'userSmall',
      tone: 'indigo',
      fields: [
        { icon: 'building', label: 'Empresa' },
        { icon: 'user', label: 'Usuários' },
        { icon: 'target', label: 'Oportunidade' },
      ],
      expandCount: 4,
      x: 280,
      y: 400,
    },
    {
      id: 'opportunities',
      label: 'Oportunidades',
      meta: '42',
      isCustom: false,
      headerIcon: 'targetSmall',
      tone: 'red',
      fields: [
        { icon: 'building', label: 'Empresa' },
        { icon: 'tag', label: '12 campos' },
      ],
      expandCount: 23,
      x: 380,
      y: 190,
    },
  ],
  connections: [
    { from: 'workspaces', to: 'companies' },
    { from: 'workspaces', to: 'users' },
    { from: 'users', to: 'people' },
    { from: 'companies', to: 'people' },
    { from: 'companies', to: 'opportunities' },
    { from: 'people', to: 'opportunities' },
  ],
};
