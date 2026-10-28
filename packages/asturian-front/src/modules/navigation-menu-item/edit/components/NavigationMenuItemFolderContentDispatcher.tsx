import { isDefined } from 'zyra-shared/utils';
import { type NavigationMenuItem } from '~/generated-metadata/graphql';

import { NavigationMenuItemFolderContent } from '@/navigation-menu-item/display/folder/components/NavigationMenuItemFolderContent';

type NavigationMenuItemFolderContentDispatcherEffectProps = {
  folderName: string;
  folderId: string;
  navigationMenuItems?: NavigationMenuItem[];
  shouldShowBackButton?: boolean;
};

export const NavigationMenuItemFolderContentDispatcherEffect = ({
  folderName,
  folderId,
  navigationMenuItems,
  shouldShowBackButton,
}: NavigationMenuItemFolderContentDispatcherEffectProps) => {
  if (isDefined(navigationMenuItems)) {
    return (
      <NavigationMenuItemFolderContent
        folderId={folderId}
        folderName={folderName}
        navigationMenuItems={navigationMenuItems}
        shouldShowBackButton={shouldShowBackButton}
      />
    );
  }

  return null;
};
