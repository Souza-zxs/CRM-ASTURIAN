import { type WorkflowIconName } from './WorkflowIcons';

export type WorkflowNodeDefinition = {
  badge?: string;
  dimmed?: boolean;
  icon: WorkflowIconName;
  id: string;
  label: string;
  labelTone: 'amber' | 'gray' | 'green';
  type: string;
  x: number;
  y: number;
};

export type WorkflowEdgeDefinition = {
  from: string;
  to: string;
};

const TRUNK_X = 55;
const RIGHT_X = 200;
const LEFT_X = 5;

// Mock fiction workflow graph (product-screenshot copy, English). The
// animation activates node prefixes on a fixed beat, then loops.
export const WORKFLOW_GRAPH: {
  animationSequence: string[];
  edges: WorkflowEdgeDefinition[];
  nodeHeightPx: number;
  nodeWidthPx: number;
  nodes: WorkflowNodeDefinition[];
  stepIntervalMs: number;
} = {
  nodes: [
    {
      id: 'trigger',
      type: 'Gatilho',
      label: 'Registro é criado',
      icon: 'playlistAdd',
      labelTone: 'green',
      x: TRUNK_X,
      y: 16,
      badge: '1',
    },
    {
      id: 'search',
      type: 'Ação',
      label: 'Buscar registros',
      icon: 'search',
      labelTone: 'green',
      x: TRUNK_X,
      y: 92,
      badge: '1',
    },
    {
      id: 'iterator',
      type: 'Fluxo',
      label: 'Iterador',
      icon: 'repeat',
      labelTone: 'amber',
      x: TRUNK_X,
      y: 168,
    },
    {
      id: 'email',
      type: 'Ação',
      label: 'Enviar e-mail',
      icon: 'send',
      labelTone: 'amber',
      x: RIGHT_X,
      y: 280,
    },
    {
      id: 'update',
      type: 'Ação',
      label: 'Atualizar registro',
      icon: 'reload',
      labelTone: 'gray',
      x: LEFT_X,
      y: 340,
      badge: '3',
      dimmed: true,
    },
    {
      id: 'create',
      type: 'Ação',
      label: 'Criar registro',
      icon: 'plus',
      labelTone: 'green',
      x: RIGHT_X - 5,
      y: 400,
      badge: '1',
    },
  ],
  edges: [
    { from: 'trigger', to: 'search' },
    { from: 'search', to: 'iterator' },
    { from: 'iterator', to: 'update' },
    { from: 'email', to: 'create' },
  ],
  animationSequence: [
    'trigger',
    'search',
    'iterator',
    'email',
    'update',
    'create',
  ],
  stepIntervalMs: 800,
  nodeWidthPx: 170,
  nodeHeightPx: 48,
};
