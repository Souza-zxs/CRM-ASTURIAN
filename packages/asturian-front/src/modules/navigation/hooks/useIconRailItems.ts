import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { useIcons } from 'zyra-ui/icon';

import { currentNavigationMenuItemFolderIdState } from '@/navigation-menu-item/common/states/currentNavigationMenuItemFolderIdState';
import { isNavigationMenuItemFolder } from '@/navigation-menu-item/common/utils/isNavigationMenuItemFolder';
import { useNavigationMenuItemsData } from '@/navigation-menu-item/display/hooks/useNavigationMenuItemsData';
import { useSortedNavigationMenuItems } from '@/navigation-menu-item/display/hooks/useSortedNavigationMenuItems';
import { getNavigationMenuItemObjectNameSingular } from '@/navigation-menu-item/display/object/utils/getNavigationMenuItemObjectNameSingular';
import { getNavigationMenuItemComputedLink } from '@/navigation-menu-item/display/utils/getNavigationMenuItemComputedLink';
import { getNavigationMenuItemLabel } from '@/navigation-menu-item/display/utils/getNavigationMenuItemLabel';
import { getWorkspaceSidebarOrphanItemsInDisplayOrder } from '@/navigation-menu-item/display/utils/getWorkspaceSidebarOrphanItemsInDisplayOrder';
import { type IconRailItem } from '@/navigation/types/IconRailItem';
import {
  getIconRailItems,
  type IconRailEntry,
} from '@/navigation/utils/getIconRailItems';
import { objectMetadataItemsSelector } from '@/object-metadata/states/objectMetadataItemsSelector';
import { useObjectPermissions } from '@/object-record/hooks/useObjectPermissions';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { viewsSelector } from '@/views/states/selectors/viewsSelector';

export const useIconRailItems = (): IconRailItem[] => {
  const { workspaceNavigationMenuItems } = useNavigationMenuItemsData();
  const { workspaceNavigationMenuItemsSorted } = useSortedNavigationMenuItems();
  const objectMetadataItems = useAtomStateValue(objectMetadataItemsSelector);
  const views = useAtomStateValue(viewsSelector);
  const { objectPermissionsByObjectMetadataId } = useObjectPermissions();
  const openedFolderId = useAtomStateValue(
    currentNavigationMenuItemFolderIdState,
  );
  const { pathname } = useLocation();
  const { getIcon } = useIcons();

  return useMemo(() => {
    // The helper already drops object-backed items the user cannot read.
    const topLevelItems = getWorkspaceSidebarOrphanItemsInDisplayOrder({
      workspaceNavigationMenuItems,
      workspaceNavigationMenuItemsSorted,
      objectMetadataItems,
      views,
      objectPermissionsByObjectMetadataId,
    });

    const entries = topLevelItems.map((item): IconRailEntry => {
      const label = getNavigationMenuItemLabel(item, objectMetadataItems, views);

      if (isNavigationMenuItemFolder(item)) {
        return { kind: 'folder', id: item.id, label, iconName: item.icon };
      }

      const objectNameSingular = getNavigationMenuItemObjectNameSingular(
        item,
        objectMetadataItems,
        views,
      );
      const objectIconName = objectMetadataItems.find(
        (objectMetadataItem) =>
          objectMetadataItem.nameSingular === objectNameSingular,
      )?.icon;

      return {
        kind: 'link',
        id: item.id,
        label,
        iconName: item.icon ?? objectIconName,
        path:
          getNavigationMenuItemComputedLink({
            item,
            objectMetadataItems,
            views,
          }) ?? null,
        isReadable: true,
      };
    });

    return getIconRailItems({
      entries,
      openedFolderId,
      activePath: pathname,
      getIcon,
    });
  }, [
    workspaceNavigationMenuItems,
    workspaceNavigationMenuItemsSorted,
    objectMetadataItems,
    views,
    objectPermissionsByObjectMetadataId,
    openedFolderId,
    pathname,
    getIcon,
  ]);
};
