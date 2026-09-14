import IconZyraStarRaw from '@assets/icons/zyra-star.svg?react';
import { type IconComponentProps } from '@ui/icon/types/IconComponent';
import { useTheme } from '@ui/theme-constants';

type IconZyraStarProps = Pick<IconComponentProps, 'size' | 'stroke'>;

export const IconZyraStar = (props: IconZyraStarProps) => {
  const theme = useTheme();
  const size = props.size ?? 24;
  const stroke = props.stroke ?? theme.icon.stroke.md;

  return <IconZyraStarRaw height={size} width={size} strokeWidth={stroke} />;
};
