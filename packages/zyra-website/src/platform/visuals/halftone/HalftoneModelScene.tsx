'use client';

import { styled } from '@linaria/react';
import { useCallback, useEffect, useRef } from 'react';

import { useAsyncResource } from '../engine/use-async-resource';
import { useVisualRuntime } from '../engine/use-visual-runtime';
import {
  loadGlbGeometry,
  type LoadGlbGeometryOptions,
} from '../three-runtime/load-glb-geometry';
import { createBandSession } from './create-band-session';
import { createHalftoneSession } from './create-halftone-session';
import { type HalftoneInitialPose } from './halftone-interaction-state';
import {
  resolveHalftoneSettings,
  type HalftoneSceneSettingsOverrides,
} from './halftone-settings';

const SceneContainer = styled.div`
  height: 100%;
  width: 100%;
`;

export type HalftoneModelSceneProps = {
  modelUrl: string;
  settings: HalftoneSceneSettingsOverrides;
  initialPose?: HalftoneInitialPose & { timeElapsed?: number };
  geometryOptions?: LoadGlbGeometryOptions;
};

export function HalftoneModelScene({
  modelUrl,
  settings,
  initialPose,
  geometryOptions,
}: HalftoneModelSceneProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const { reducedMotion } = useVisualRuntime();

  const loader = useCallback(
    () => loadGlbGeometry(modelUrl, geometryOptions),
    // geometryOptions is a config record with stable identity per mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [modelUrl],
  );
  const geometry = useAsyncResource(loader);

  useEffect(() => {
    const container = containerRef.current;
    if (container === null || geometry === null) {
      return;
    }

    const resolved = resolveHalftoneSettings(settings);
    let cancelled = false;
    let session: { dispose: () => void } | null = null;

    const createSession = () =>
      resolved.halftone.variant === 'rows'
        ? createHalftoneSession({
            container,
            geometry,
            settings: resolved,
            initialPose,
            reducedMotion,
          })
        : createBandSession({
            container,
            geometry,
            settings: resolved,
            initialPose,
            reducedMotion,
          });

    // createVisualRenderer() returns null instead of throwing when the GPU
    // refuses a new WebGL context — common when several scenes (e.g. a row
    // of cards) scroll into view together and request one in the same
    // burst. Retry a few times as earlier scenes finish acquiring their
    // context and the budget frees up, instead of leaving the slot blank
    // forever.
    const MAX_ATTEMPTS = 4;
    const RETRY_DELAY_MS = 300;

    void (async () => {
      // Sequential by design: each retry waits out the previous attempt's
      // WebGL context acquisition (or its backoff delay) before trying
      // again, so there's nothing here to run in parallel with Promise.all.
      // `cancelled` is flipped by the effect's cleanup below, not inside
      // this loop — the linter can't see across that closure boundary.
      // eslint-disable-next-line no-unmodified-loop-condition
      for (let attempt = 0; attempt < MAX_ATTEMPTS && !cancelled; attempt++) {
        // eslint-disable-next-line no-await-in-loop
        const createdSession = await createSession();
        if (cancelled) {
          createdSession?.dispose();
          return;
        }
        if (createdSession !== null) {
          session = createdSession;
          return;
        }
        if (attempt < MAX_ATTEMPTS - 1) {
          // eslint-disable-next-line no-await-in-loop
          await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
        }
      }
    })();

    return () => {
      cancelled = true;
      session?.dispose();
    };
    // settings/initialPose are config records owned by the section; their
    // identity is stable for the life of the mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [geometry, reducedMotion]);

  return <SceneContainer ref={containerRef} />;
}
