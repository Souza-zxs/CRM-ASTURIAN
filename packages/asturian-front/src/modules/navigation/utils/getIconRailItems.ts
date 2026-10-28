import { type IconComponent } from 'zyra-ui/icon';

import { type IconRailItem } from '@/navigation/types/IconRailItem';

export const ICON_RAIL_DEFAULT_ICON_NAME = 'IconLayoutList';

export type IconRailEntry =
  | {
      kind: 'folder';
      id: string;
      label: string;
      iconName?: string | null;
      // First accessible child of the folder; null when the user can read none.
      path: string | null;
      childPaths: string[];
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
  activePath: string;
  getIcon: (iconName: string) => IconComponent;
};

const getPathname = (path: string): string => path.split('?')[0];

const isWithinPath = (activePath: string, basePath: string): boolean =>
  activePath === basePath || activePath.startsWith(`${basePath}/`);

// Entries arrive already in menu display order. Links the user cannot read,
// and folders with no readable child, are dropped so the rail never shows
// dead ends.
export const getIconRailItems = ({
  entries,
  activePath,
  getIcon,
}: GetIconRailItemsArgs): IconRailItem[] =>
  entries.flatMap((entry): IconRailItem[] => {
    const Icon = getIcon(entry.iconName ?? ICON_RAIL_DEFAULT_ICON_NAME);

    if (entry.kind === 'folder') {
      if (entry.path === null) {
        return [];
      }

      return [
        {
          id: entry.id,
          label: entry.label,
          Icon,
          kind: 'folder',
          path: entry.path,
          isActive: entry.childPaths.some((childPath) =>
            isWithinPath(activePath, getPathname(childPath)),
          ),
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
        isActive: isWithinPath(activePath, getPathname(entry.path)),
      },
    ];
  });
