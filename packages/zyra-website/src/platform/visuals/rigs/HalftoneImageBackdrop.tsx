'use client';

import { lazy, type ReactNode } from 'react';

import { ClientOnly } from '@/platform/client-only';

import { type ImageSessionSettings } from '../halftone/create-image-session';
import { VisualMount } from '../engine/VisualMount';

// The ONLY import() of the heavy image pipeline.
const HalftoneImageScene = lazy(() =>
  import('../halftone/HalftoneImageScene').then((module) => ({
    default: module.HalftoneImageScene,
  })),
);

export type HalftoneImageBackdropProps = {
  imageUrl: string;
  settings: ImageSessionSettings;
  pointerRootSelector?: string;
  onFirstFrame?: () => void;
  poster?: ReactNode;
  priority?: boolean;
  loading?: 'lazy' | 'eager';
  detachFromLayout?: boolean;
  // Backdrops keep their artwork under reduced motion as a frozen frame.
  reducedMotionMode?: 'poster' | 'designed';
};

export function HalftoneImageBackdrop({
  imageUrl,
  settings,
  pointerRootSelector,
  onFirstFrame,
  poster = null,
  priority = false,
  loading = 'lazy',
  detachFromLayout = false,
  reducedMotionMode = 'designed',
}: HalftoneImageBackdropProps) {
  return (
    <VisualMount
      detachFromLayout={detachFromLayout}
      loading={loading}
      poster={poster}
      priority={priority}
      reducedMotion={reducedMotionMode}
    >
      <ClientOnly>
        <HalftoneImageScene
          imageUrl={imageUrl}
          onFirstFrame={onFirstFrame}
          pointerRootSelector={pointerRootSelector}
          settings={settings}
        />
      </ClientOnly>
    </VisualMount>
  );
}
