import { currentNavigationMenuItemFolderIdState } from '@/navigation-menu-item/common/states/currentNavigationMenuItemFolderIdState';
import { AppIconRail } from '@/navigation/components/AppIconRail';
import { type IconRailItem } from '@/navigation/types/IconRailItem';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { fireEvent, render, screen } from '@testing-library/react';
import { Provider as JotaiProvider } from 'jotai';
import { MemoryRouter } from 'react-router-dom';
import { type IconComponent } from 'zyra-ui/icon';

const mockNavigate = jest.fn();
const mockUseIsMobile = jest.fn();
const mockUseIconRailItems = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

jest.mock('@/ui/utilities/responsive/hooks/useIsMobile', () => ({
  useIsMobile: () => mockUseIsMobile(),
}));

jest.mock('@/navigation/hooks/useIconRailItems', () => ({
  useIconRailItems: () => mockUseIconRailItems(),
}));

const TestIcon = (() => <svg data-testid="rail-icon" />) as unknown as IconComponent;

const buildItem = (overrides: Partial<IconRailItem>): IconRailItem => ({
  id: 'item',
  label: 'Item',
  Icon: TestIcon,
  kind: 'link',
  path: '/item',
  isActive: false,
  ...overrides,
});

const renderRail = () =>
  render(
    <JotaiProvider store={jotaiStore}>
      <MemoryRouter>
        <AppIconRail />
      </MemoryRouter>
    </JotaiProvider>,
  );

describe('AppIconRail', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseIsMobile.mockReturnValue(false);
    jotaiStore.set(currentNavigationMenuItemFolderIdState.atom, null);
  });

  it('should render one button per rail item with its label as aria-label', () => {
    mockUseIconRailItems.mockReturnValue([
      buildItem({ id: 'a', label: 'Início' }),
      buildItem({ id: 'b', label: 'Vendas', kind: 'folder', path: undefined }),
    ]);

    renderRail();

    expect(screen.getByRole('button', { name: 'Início' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Vendas' })).toBeInTheDocument();
  });

  it('should mark the active item with aria-current="page"', () => {
    mockUseIconRailItems.mockReturnValue([
      buildItem({ id: 'a', label: 'Início', isActive: true }),
      buildItem({ id: 'b', label: 'Vendas' }),
    ]);

    renderRail();

    expect(screen.getByRole('button', { name: 'Início' })).toHaveAttribute(
      'aria-current',
      'page',
    );
    expect(screen.getByRole('button', { name: 'Vendas' })).not.toHaveAttribute(
      'aria-current',
    );
  });

  it('should open the first accessible item of a folder when a folder item is clicked', () => {
    mockUseIconRailItems.mockReturnValue([
      buildItem({
        id: 'folder-1',
        label: 'Vendas',
        kind: 'folder',
        path: '/objects/people',
      }),
    ]);

    renderRail();
    fireEvent.click(screen.getByRole('button', { name: 'Vendas' }));

    expect(mockNavigate).toHaveBeenCalledWith('/objects/people');
  });

  it('should not put the desktop drawer in the mobile folder drill-in mode', () => {
    mockUseIconRailItems.mockReturnValue([
      buildItem({
        id: 'folder-1',
        label: 'Vendas',
        kind: 'folder',
        path: '/objects/people',
      }),
    ]);

    renderRail();
    fireEvent.click(screen.getByRole('button', { name: 'Vendas' }));

    expect(
      jotaiStore.get(currentNavigationMenuItemFolderIdState.atom),
    ).toBeNull();
  });

  it('should navigate to the item path when a link item is clicked', () => {
    mockUseIconRailItems.mockReturnValue([
      buildItem({ id: 'a', label: 'Início', path: '/objects/dashboards' }),
    ]);

    renderRail();
    fireEvent.click(screen.getByRole('button', { name: 'Início' }));

    expect(mockNavigate).toHaveBeenCalledWith('/objects/dashboards');
  });

  it('should keep every item reachable when there are more than 12 items', () => {
    mockUseIconRailItems.mockReturnValue(
      Array.from({ length: 14 }, (_, index) =>
        buildItem({ id: `item-${index}`, label: `Item ${index}` }),
      ),
    );

    renderRail();

    expect(screen.getAllByTestId('rail-icon')).toHaveLength(14);
  });

  it('should not render the rail on mobile', () => {
    mockUseIsMobile.mockReturnValue(true);
    mockUseIconRailItems.mockReturnValue([buildItem({ label: 'Início' })]);

    renderRail();

    expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
  });
});
