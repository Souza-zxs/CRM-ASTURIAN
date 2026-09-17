import { millisecondsToSeconds } from 'date-fns';
import { animate } from 'framer-motion';
import { useCallback, useEffect, useState } from 'react';
import { isDefined } from '@ui/utilities/utils/isDefined';

// framer-motion doesn't re-export these two types from its public API (only
// from its internal 'motion-dom' dependency) — derive them from the number
// overload of `animate` itself instead of depending on an unofficial
// subpath. This file only ever animates numbers, so no need for a generic.
type AnimationPlaybackControls = ReturnType<typeof animate<number>>;
type NumberAnimationTransition = NonNullable<
  Parameters<typeof animate<number>>[2]
>;

export const useProgressAnimation = ({
  autoPlay = true,
  initialValue = 0,
  finalValue = 100,
  options,
}: {
  autoPlay?: boolean;
  initialValue?: number;
  finalValue?: number;
  options?: NumberAnimationTransition;
}) => {
  const [animation, setAnimation] = useState<
    AnimationPlaybackControls | undefined
  >();
  const [value, setValue] = useState(initialValue);

  const startAnimation = useCallback(() => {
    if (isDefined(animation)) return;

    const duration = isDefined(options?.duration)
      ? millisecondsToSeconds(options.duration)
      : undefined;

    setAnimation(
      animate(initialValue, finalValue, {
        ...options,
        duration,
        onUpdate: (nextValue: number) => {
          if (value === nextValue) return;
          setValue(nextValue);
          options?.onUpdate?.(nextValue);
        },
      }),
    );
  }, [animation, finalValue, initialValue, options, value]);

  useEffect(() => {
    if (autoPlay && !animation) {
      startAnimation();
    }
  }, [animation, autoPlay, startAnimation]);

  return {
    animation,
    startAnimation,
    value,
  };
};
