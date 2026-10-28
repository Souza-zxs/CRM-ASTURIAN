import { type IconComponent } from 'zyra-ui/icon';

export type IconRailItem = {
  id: string;
  label: string;
  Icon: IconComponent;
  kind: 'folder' | 'link';
  path?: string;
  isActive: boolean;
};
