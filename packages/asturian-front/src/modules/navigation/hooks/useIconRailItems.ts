import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { useIcons } from 'zyra-ui/icon';

import { isNavigationMenuItemFolder } from '@/navigation-menu-item/common/utils/isNavigationMenuItemFolder';
import { useNavigationMenuItemsByFolder } from '@/navigation-menu-item/display/folder/hooks/useNavigationMenuItemsByFolder';
import { useNavigationMenuItemsData } from '@/navigation-menu-item/display/hooks/useNavigationMenuItemsData';
import { useSortedNavigationMenuItems } from '@/navigation-menu-item/display/hooks/useSortedNavigationMenuItems';
import { getNavigationMenuItemObjectNameSingular } from '@/navigation-menu-item/display/object/utils/getNavigationMenuItemObjectNameSingular';
import { getNavigationMenuItemComputedLink } from '@/navigation-menu-item/display/utils/getNavigationMenuItemComputedLink';
import { getNavigationMenuItemLabel } from '@/navigation-menu-item/display/utils/getNavigationMenuItemLabel';
import { getWorkspaceSidebarOrphanItemsInDisplayOrder } from '@/navigation-menu-item/display/utils/getWorkspaceSidebarOrphanItemsInDisplayOrder';
import { type IconRailItem } from '@/navigation/types/IconRailItem';
import { getFirstNavigationMenuItemLink } from '@/navigation/utils/getFirstNavigationMenuItemLink';
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
  const { workspaceNavigationMenuItemsByFolder } =
    useNavigationMenuItemsByFolder();
  const objectMetadataItems = useAtomStateValue(objectMetadataItemsSelector);
  const views = useAtomStateValue(viewsSelector);
  const { objectPermissionsByObjectMetadataId } = useObjectPermissions();
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

    // Children of a folder are only filtered by active object, not by read
    // permission, so each one goes through the same link resolver the home
    // page uses (it checks canReadObjectRecords).
    const getReadableChildPaths = (folderId: string): string[] => {
      const folder = workspaceNavigationMenuItemsByFolder.find(
        (candidate) => candidate.id === folderId,
      );

      return (folder?.navigationMenuItems ?? []).flatMap((child) => {
        const link = getFirstNavigationMenuItemLink({
          navigationMenuItemsInDisplayOrder: [child],
          objectMetadataItems,
          views,
          objectPermissionsByObjectMetadataId,
        });

        return link === null ? [] : [link];
      });
    };

    const entries = topLevelItems.map((item): IconRailEntry => {
      const label = getNavigationMenuItemLabel(
        item,
        objectMetadataItems,
        views,
      );

      if (isNavigationMenuItemFolder(item)) {
        const childPaths = getReadableChildPaths(item.id);

        return {
          kind: 'folder',
          id: item.id,
          label,
          iconName: item.icon,
          path: childPaths[0] ?? null,
          childPaths,
        };
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
      activePath: pathname,
      getIcon,
    });
  }, [
    workspaceNavigationMenuItems,
    workspaceNavigationMenuItemsSorted,
    workspaceNavigationMenuItemsByFolder,
    objectMetadataItems,
    views,
    objectPermissionsByObjectMetadataId,
    pathname,
    getIcon,
  ]);
};
