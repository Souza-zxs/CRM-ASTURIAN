import { type IconComponent } from 'zyra-ui/icon';

import { type IconRailItem } from '@/navigation/types/IconRailItem';

export const ICON_RAIL_DEFAULT_ICON_NAME = 'IconLayoutList';

export type IconRailEntry =
  | {
      kind: 'folder';
      id: string;
      label: string;
      iconName?: string | null;
    }
  | {
      kind: 'link';
      id: string;
      label: string;
      iconName?: string | null;
      path: string | null;
      isReadable: boolean;
    };

type GetIconRailItemsArgs = {
  entries: IconRailEntry[];
  openedFolderId: string | null;
  activePath: string;
  getIcon: (iconName: string) => IconComponent;
};

// Entries arrive already in menu display order; links the user cannot read
// or that have no destination are dropped so the rail never shows dead ends.
export const getIconRailItems = ({
  entries,
  openedFolderId,
  activePath,
  getIcon,
}: GetIconRailItemsArgs): IconRailItem[] =>
  entries.flatMap((entry): IconRailItem[] => {
    const Icon = getIcon(entry.iconName ?? ICON_RAIL_DEFAULT_ICON_NAME);

    if (entry.kind === 'folder') {
      return [
        {
          id: entry.id,
          label: entry.label,
          Icon,
          kind: 'folder',
          isActive: entry.id === openedFolderId,
        },
      ];
    }

    if (!entry.isReadable || entry.path === null) {
      return [];
    }

    return [
      {
        id: entry.id,
        label: entry.label,
        Icon,
        kind: 'link',
        path: entry.path,
        isActive: entry.path === activePath,
      },
    ];
  });
