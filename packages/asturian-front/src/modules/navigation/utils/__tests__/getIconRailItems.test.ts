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

const folderEntry = (
  id: string,
  label: string,
  childPaths: string[] = [`/objects/${id}`],
): IconRailEntry => ({
  kind: 'folder',
  id,
  label,
  iconName: 'IconBuildingStore',
  path: childPaths[0] ?? null,
  childPaths,
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
      activePath: '/',
      getIcon,
    });

    expect(
      items.filter((item) => item.kind === 'folder').map((item) => item.label),
    ).toEqual(['Sales', 'Productivity']);
  });

  it('should send a folder item to its first accessible child', () => {
    const items = getIconRailItems({
      entries: [folderEntry('f1', 'Sales', ['/objects/people', '/objects/companies'])],
      activePath: '/',
      getIcon,
    });

    expect(items[0]).toMatchObject({ kind: 'folder', path: '/objects/people' });
  });

  it('should hide a folder with no accessible child', () => {
    const items = getIconRailItems({
      entries: [folderEntry('empty', 'Empty', [])],
      activePath: '/',
      getIcon,
    });

    expect(items).toEqual([]);
  });

  it('should mark a folder active when the current path is inside one of its children', () => {
    const items = getIconRailItems({
      entries: [
        folderEntry('f1', 'Sales', ['/objects/people', '/objects/companies']),
        folderEntry('f2', 'Productivity', ['/objects/tasks']),
      ],
      activePath: '/object/person/abc',
      getIcon,
    });

    // /objects/people is a list; the record page lives under /object/person.
    expect(items.map((item) => item.isActive)).toEqual([false, false]);

    const onList = getIconRailItems({
      entries: [folderEntry('f1', 'Sales', ['/objects/people'])],
      activePath: '/objects/people',
      getIcon,
    });

    expect(onList[0].isActive).toBe(true);
  });

  it('should ignore the query string of a child path when matching', () => {
    const items = getIconRailItems({
      entries: [folderEntry('f1', 'Sales', ['/objects/people?viewId=1'])],
      activePath: '/objects/people',
      getIcon,
    });

    expect(items[0].isActive).toBe(true);
  });

  it('should return a link item with its path for each readable link entry', () => {
    const items = getIconRailItems({
      entries: [linkEntry('dash', 'Início')],
      activePath: '/',
      getIcon,
    });

    expect(items).toHaveLength(1);
    expect(items[0]).toMatchObject({ kind: 'link', path: '/dash' });
  });

  it('should use the default icon when an entry has no icon name', () => {
    const items = getIconRailItems({
      entries: [linkEntry('dash', 'Início', { iconName: null })],
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
      activePath: '/',
      getIcon,
    });

    expect(items.map((item) => item.id)).toEqual(['shown']);
  });

  it('should hide link entries without a destination', () => {
    const items = getIconRailItems({
      entries: [linkEntry('nowhere', 'Nowhere', { path: null })],
      activePath: '/',
      getIcon,
    });

    expect(items).toEqual([]);
  });

  it('should mark the link whose path matches the current path as active', () => {
    const items = getIconRailItems({
      entries: [linkEntry('a', 'A'), linkEntry('b', 'B')],
      activePath: '/b',
      getIcon,
    });

    expect(items.map((item) => item.isActive)).toEqual([false, true]);
  });

  it('should keep a link active on pages nested under its path', () => {
    const items = getIconRailItems({
      entries: [linkEntry('objects', 'Objects', { path: '/objects/people' })],
      activePath: '/objects/people/record-1',
      getIcon,
    });

    expect(items[0].isActive).toBe(true);
  });

  it('should keep every entry when there are more than 12', () => {
    const entries = Array.from({ length: 14 }, (_, index) =>
      linkEntry(`item-${index}`, `Item ${index}`),
    );

    const items = getIconRailItems({
      entries,
      activePath: '/',
      getIcon,
    });

    expect(items).toHaveLength(14);
  });
});
