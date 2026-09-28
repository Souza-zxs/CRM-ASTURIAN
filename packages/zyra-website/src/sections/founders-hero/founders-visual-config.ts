import { paletteColorNumber } from '@/tokens';

import { type HalftoneModelProps } from '@/platform/visuals/rigs/HalftoneModel';

// The founders hero: the halftone diamond in brand blue over the dark stage,
// turning slowly and following the drag.
export const FOUNDERS_HERO_VISUAL: Pick<
  HalftoneModelProps,
  'modelUrl' | 'settings' | 'initialPose' | 'geometryOptions'
> = {
  modelUrl: '/models/diamond.glb',
  settings: {
    previewDistance: 5,
    halftone: {
      variant: 'band',
      dashColor: paletteColorNumber('blue'),
      hoverDashColor: paletteColorNumber('white'),
    },
    animation: {
      autoSpeed: 0.1,
      followDragEnabled: true,
    },
  },
  geometryOptions: { legacyNormalization: true, postRotateZ: 1 },
  initialPose: { autoElapsed: 0, timeElapsed: 0 },
};
