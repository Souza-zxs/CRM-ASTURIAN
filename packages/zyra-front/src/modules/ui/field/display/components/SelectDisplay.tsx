import { type IconComponent } from 'zyra-ui/icon';
import { Tag } from 'zyra-ui/data-display';
import { type ThemeColor } from 'zyra-ui/theme';

type SelectDisplayProps = {
  color: ThemeColor | 'transparent';
  label: string;
  Icon?: IconComponent;
  preventPadding?: boolean;
};

export const SelectDisplay = ({
  color,
  label,
  Icon,
  preventPadding,
}: SelectDisplayProps) => {
  return (
    <Tag
      preventShrink
      color={color}
      text={label}
      Icon={Icon}
      preventPadding={preventPadding}
    />
  );
};
