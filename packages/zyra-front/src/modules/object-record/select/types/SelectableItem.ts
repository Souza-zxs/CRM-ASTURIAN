import { type AvatarType } from 'zyra-ui/data-display';
import { type IconComponent } from 'zyra-ui/icon';

export type SelectableItem<T = object> = T & {
  id: string;
  name: string;
  avatarUrl?: string;
  avatarType?: AvatarType;
  AvatarIcon?: IconComponent;
  isSelected: boolean;
  isIconInverted?: boolean;
};
