import { type IconComponent } from 'zyra-ui/icon';

import {
  getIconRailItems,
  ICON_RAIL_DEFAULT_ICON_NAME,
  type IconRailEntry,
} from '@/navigation/utils/getIconRailItems';

const buildIcon = (name: string) => {
  const Icon = () => null;
  Icon.displayName = name;

  return Icon as unknown as IconComponent;
};

const getIcon = (iconName: string) => buildIcon(iconName);

const folderEntry = (id: string, label: string): IconRailEntry => ({
  kind: 'folder',
  id,
  label,
  iconName: 'IconBuildingStore',
});

const linkEntry = (
  id: string,
  label: string,
  overrides: Partial<Extract<IconRailEntry, { kind: 'link' }>> = {},
): IconRailEntry => ({
  kind: 'link',
  id,
  label,
  iconName: 'IconLayoutDashboard',
  path: `/${id}`,
  isReadable: true,
  ...overrides,
});

describe('getIconRailItems', () => {
  it('should return one folder item per folder entry', () => {
    const items = getIconRailItems({
      entries: [folderEntry('f1', 'Sales'), folderEntry('f2', 'Productivity')],
      openedFolderId: null,
      activePath: '/',
      getIcon,
    });

    expect(
      items.filter((item) => item.kind === 'folder').map((item) => item.label),
    ).toEqual(['Sales', 'Productivity']);
  });

  it('should return a link item with its path for each readable link entry', () => {
    const items = getIconRailItems({
      entries: [linkEntry('dash', 'Início')],
      openedFolderId: null,
      activePath: '/',
      getIcon,
    });

    expect(items).toHaveLength(1);
    expect(items[0]).toMatchObject({ kind: 'link', path: '/dash' });
  });

  it('should use the default icon when an entry has no icon name', () => {
    const items = getIconRailItems({
      entries: [linkEntry('dash', 'Início', { iconName: null })],
      openedFolderId: null,
      activePath: '/',
      getIcon,
    });

    expect(
      (items[0].Icon as unknown as { displayName: string }).displayName,
    ).toBe(ICON_RAIL_DEFAULT_ICON_NAME);
  });

  it('should hide link entries the user cannot read', () => {
    const items = getIconRailItems({
      entries: [
        linkEntry('hidden', 'Hidden', { isReadable: false }),
        linkEntry('shown', 'Shown'),
      ],
      openedFolderId: null,
      activePath: '/',
      getIcon,
    });

    expect(items.map((item) => item.id)).toEqual(['shown']);
  });

  it('should hide link entries without a destination', () => {
    const items = getIconRailItems({
      entries: [linkEntry('nowhere', 'Nowhere', { path: null })],
      openedFolderId: null,
      activePath: '/',
      getIcon,
    });

    expect(items).toEqual([]);
  });

  it('should mark only the opened folder as active', () => {
    const items = getIconRailItems({
      entries: [folderEntry('f1', 'Sales'), folderEntry('f2', 'Productivity')],
      openedFolderId: 'f2',
      activePath: '/',
      getIcon,
    });

    expect(items.map((item) => item.isActive)).toEqual([false, true]);
  });

  it('should mark the link whose path matches the current path as active', () => {
    const items = getIconRailItems({
      entries: [linkEntry('a', 'A'), linkEntry('b', 'B')],
      openedFolderId: null,
      activePath: '/b',
      getIcon,
    });

    expect(items.map((item) => item.isActive)).toEqual([false, true]);
  });

  it('should keep every entry when there are more than 12', () => {
    const entries = Array.from({ length: 14 }, (_, index) =>
      linkEntry(`item-${index}`, `Item ${index}`),
    );

    const items = getIconRailItems({
      entries,
      openedFolderId: null,
      activePath: '/',
      getIcon,
    });

    expect(items).toHaveLength(14);
  });
});
