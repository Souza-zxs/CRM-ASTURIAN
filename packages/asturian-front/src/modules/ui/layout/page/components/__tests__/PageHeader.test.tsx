import { PageHeader } from '@/ui/layout/page/components/PageHeader';
import { isNavigationDrawerExpandedState } from '@/ui/navigation/states/isNavigationDrawerExpanded';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { fireEvent, render, screen } from '@testing-library/react';
import { Provider as JotaiProvider } from 'jotai';
import { MemoryRouter } from 'react-router-dom';

const mockUseIsMobile = jest.fn();

jest.mock('@/ui/utilities/responsive/hooks/useIsMobile', () => ({
  useIsMobile: () => mockUseIsMobile(),
}));

const renderHeader = (props: Partial<Parameters<typeof PageHeader>[0]> = {}) =>
  render(
    <JotaiProvider store={jotaiStore}>
      <MemoryRouter>
        <PageHeader title="Pessoas" {...props} />
      </MemoryRouter>
    </JotaiProvider>,
  );

describe('PageHeader', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseIsMobile.mockReturnValue(false);
    jotaiStore.set(isNavigationDrawerExpandedState.atom, true);
  });

  it('should render the title', () => {
    renderHeader();

    expect(screen.getByTestId('top-bar-title')).toHaveTextContent('Pessoas');
  });

  it('should call onClosePage when the close button is clicked', () => {
    const onClosePage = jest.fn();

    renderHeader({ hasClosePageButton: true, onClosePage });
    fireEvent.click(screen.getByRole('button'));

    expect(onClosePage).toHaveBeenCalledTimes(1);
  });

  it('should render the page actions passed as children', () => {
    renderHeader({ children: <button type="button">Novo</button> });

    expect(screen.getByRole('button', { name: 'Novo' })).toBeInTheDocument();
  });

  it('should show the collapse button when the drawer is collapsed on desktop', () => {
    jotaiStore.set(isNavigationDrawerExpandedState.atom, false);

    renderHeader();

    expect(screen.getAllByRole('button').length).toBeGreaterThan(0);
  });

  it('should not show the collapse button when the drawer is expanded', () => {
    renderHeader();

    expect(screen.queryAllByRole('button')).toHaveLength(0);
  });
});
