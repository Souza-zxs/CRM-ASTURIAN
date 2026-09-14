import { NavigationMenuItemType } from 'zyra-shared/types';

export const hasNavigationMenuItemOwnColor = (item: { type?: string | null }) =>
  item.type === NavigationMenuItemType.FOLDER;
