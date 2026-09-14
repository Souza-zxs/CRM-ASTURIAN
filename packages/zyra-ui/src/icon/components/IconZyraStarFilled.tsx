import IconZyraStarFilledRaw from '@assets/icons/zyra-star-filled.svg?react';
import { type IconComponentProps } from '@ui/icon/types/IconComponent';
import { useTheme } from '@ui/theme-constants';

type IconZyraStarFilledProps = Pick<IconComponentProps, 'size' | 'stroke'>;

export const IconZyraStarFilled = (props: IconZyraStarFilledProps) => {
  const theme = useTheme();
  const size = props.size ?? 24;
  const stroke = props.stroke ?? theme.icon.stroke.md;

  return (
    <IconZyraStarFilledRaw height={size} width={size} strokeWidth={stroke} />
  );
};
