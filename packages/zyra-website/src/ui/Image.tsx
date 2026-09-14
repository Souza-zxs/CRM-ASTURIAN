import { type CSSProperties, type ImgHTMLAttributes } from 'react';

// Drop-in replacement for next/image's `fill` mode (the only mode this
// codebase uses): the image absolutely fills its positioned parent. There is
// no build-time image optimization here — src stays whatever was passed.
export type ImageProps = Omit<
  ImgHTMLAttributes<HTMLImageElement>,
  'sizes' | 'style'
> & {
  alt: string;
  fill?: boolean;
  priority?: boolean;
  sizes?: string;
  style?: CSSProperties;
};

const FILL_STYLE: CSSProperties = {
  height: '100%',
  inset: 0,
  position: 'absolute',
  width: '100%',
};

export function Image({
  fill,
  priority,
  sizes: _sizes,
  style,
  ...props
}: ImageProps) {
  return (
    <img
      {...props}
      fetchPriority={priority ? 'high' : undefined}
      loading={priority ? 'eager' : 'lazy'}
      style={fill ? { ...FILL_STYLE, ...style } : style}
    />
  );
}
