import { v4 } from 'uuid';

import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatNavigationMenuItemMaps } from 'src/engine/metadata-modules/flat-navigation-menu-item/types/flat-navigation-menu-item-maps.type';
import { addFlatNavigationMenuItemToMapsAndUpdateIndex } from 'src/engine/metadata-modules/flat-navigation-menu-item/utils/add-flat-navigation-menu-item-to-maps-and-update-index.util';
import { type FlatView } from 'src/engine/metadata-modules/flat-view/types/flat-view.type';
import {
  STANDARD_NAVIGATION_MENU_ITEM_DEFAULT_COLORS,
  STANDARD_NAVIGATION_MENU_ITEMS,
} from 'src/engine/workspace-manager/zyra-standard-application/constants/standard-navigation-menu-item.constant';
import { createStandardNavigationMenuItemFlatMetadata } from 'src/engine/workspace-manager/zyra-standard-application/utils/navigation-menu-item/create-standard-navigation-menu-item-flat-metadata.util';
import {
  createStandardNavigationMenuItemFolderFlatMetadata,
  createStandardNavigationMenuItemFolderItemFlatMetadata,
} from 'src/engine/workspace-manager/zyra-standard-application/utils/navigation-menu-item/create-standard-navigation-menu-item-folder-flat-metadata.util';

const FLAT_NAVIGATION_MENU_ITEM_NAMES = ['allDashboards'] as const;

const STANDARD_NAVIGATION_MENU_ITEM_FOLDERS = [
  {
    folderName: 'salesFolder',
    itemNames: ['allPeople', 'allCompanies', 'allOpportunities'] as const,
  },
  {
    folderName: 'productivityFolder',
    itemNames: ['allTasks', 'allNotes'] as const,
  },
  {
    folderName: 'workflowsFolder',
    itemNames: [
      'workflowsFolderAllWorkflows',
      'workflowsFolderAllWorkflowRuns',
      'workflowsFolderAllWorkflowVersions',
    ] as const,
  },
] as const;

export const buildStandardFlatNavigationMenuItemMaps = ({
  now,
  workspaceId,
  zyraStandardApplicationId,
  dependencyFlatEntityMaps: { flatViewMaps },
}: {
  now: string;
  workspaceId: string;
  zyraStandardApplicationId: string;
  dependencyFlatEntityMaps: {
    flatViewMaps: FlatEntityMaps<FlatView>;
  };
}): FlatNavigationMenuItemMaps => {
  const flatNavigationMenuItemMaps: FlatNavigationMenuItemMaps = {
    ...createEmptyFlatEntityMaps(),
    byUserWorkspaceIdAndFolderId: {},
  };

  for (const navigationMenuItemName of FLAT_NAVIGATION_MENU_ITEM_NAMES) {
    const navigationMenuItemDefinition =
      STANDARD_NAVIGATION_MENU_ITEMS[navigationMenuItemName];

    const flatNavigationMenuItem = createStandardNavigationMenuItemFlatMetadata(
      {
        workspaceId,
        navigationMenuItemName,
        viewUniversalIdentifier:
          navigationMenuItemDefinition.viewUniversalIdentifier,
        position: navigationMenuItemDefinition.position,
        navigationMenuItemId: v4(),
        dependencyFlatEntityMaps: {
          flatViewMaps,
        },
        zyraStandardApplicationId,
        now,
      },
    );

    addFlatNavigationMenuItemToMapsAndUpdateIndex({
      flatNavigationMenuItem,
      flatNavigationMenuItemMaps,
    });
  }

  for (const {
    folderName,
    itemNames,
  } of STANDARD_NAVIGATION_MENU_ITEM_FOLDERS) {
    const folderDefinition = STANDARD_NAVIGATION_MENU_ITEMS[folderName];
    const folderId = v4();
    const folder = createStandardNavigationMenuItemFolderFlatMetadata({
      universalIdentifier: folderDefinition.universalIdentifier,
      name: folderDefinition.name,
      icon: folderDefinition.icon,
      position: folderDefinition.position,
      navigationMenuItemId: folderId,
      workspaceId,
      zyraStandardApplicationId,
      now,
    });

    addFlatNavigationMenuItemToMapsAndUpdateIndex({
      flatNavigationMenuItem: folder,
      flatNavigationMenuItemMaps,
    });

    for (const folderItemName of itemNames) {
      const folderItemDefinition =
        STANDARD_NAVIGATION_MENU_ITEMS[folderItemName];

      const folderItem = createStandardNavigationMenuItemFolderItemFlatMetadata(
        {
          universalIdentifier: folderItemDefinition.universalIdentifier,
          viewUniversalIdentifier: folderItemDefinition.viewUniversalIdentifier,
          folderId,
          folderUniversalIdentifier:
            folderItemDefinition.folderUniversalIdentifier,
          position: folderItemDefinition.position,
          navigationMenuItemId: v4(),
          workspaceId,
          zyraStandardApplicationId,
          color:
            STANDARD_NAVIGATION_MENU_ITEM_DEFAULT_COLORS[folderItemName] ??
            null,
          dependencyFlatEntityMaps: {
            flatViewMaps,
          },
          now,
        },
      );

      addFlatNavigationMenuItemToMapsAndUpdateIndex({
        flatNavigationMenuItem: folderItem,
        flatNavigationMenuItemMaps,
      });
    }
  }

  return flatNavigationMenuItemMaps;
};
