'use client';

import { lazy, type ReactNode } from 'react';

import { ClientOnly } from '@/platform/client-only';

import { type HalftoneInitialPose } from '../halftone/halftone-interaction-state';
import { type HalftoneSceneSettingsOverrides } from '../halftone/halftone-settings';
import { type LoadGlbGeometryOptions } from '../three-runtime/load-glb-geometry';
import { VisualMount } from '../engine/VisualMount';

// The ONLY import() of the heavy model pipeline: three stays out of the
// main chunk, and the fetch happens after policy + viewport + slot grant.
const HalftoneModelScene = lazy(() =>
  import('../halftone/HalftoneModelScene').then((module) => ({
    default: module.HalftoneModelScene,
  })),
);

export type HalftoneModelProps = {
  modelUrl: string;
  settings: HalftoneSceneSettingsOverrides;
  initialPose?: HalftoneInitialPose & { timeElapsed?: number };
  geometryOptions?: LoadGlbGeometryOptions;
  poster?: ReactNode;
  priority?: boolean;
  loading?: 'lazy' | 'eager';
  // Models render a designed frozen frame under reduced motion by default:
  // the artwork stays, only the travel disappears.
  reducedMotionMode?: 'poster' | 'designed';
};

export function HalftoneModel({
  modelUrl,
  settings,
  initialPose,
  geometryOptions,
  poster = null,
  priority = false,
  loading = 'lazy',
  reducedMotionMode = 'designed',
}: HalftoneModelProps) {
  return (
    <VisualMount
      loading={loading}
      poster={poster}
      priority={priority}
      reducedMotion={reducedMotionMode}
    >
      <ClientOnly>
        <HalftoneModelScene
          geometryOptions={geometryOptions}
          initialPose={initialPose}
          modelUrl={modelUrl}
          settings={settings}
        />
      </ClientOnly>
    </VisualMount>
  );
}
