import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

import { NavigationDrawerItem } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerItem';
import { getJestMetadataAndApolloMocksWrapper } from '~/testing/jest/getJestMetadataAndApolloMocksWrapper';

const JestWrapper = getJestMetadataAndApolloMocksWrapper({ apolloMocks: [] });

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <MemoryRouter>
    <JestWrapper>{children}</JestWrapper>
  </MemoryRouter>
);

describe('NavigationDrawerItem', () => {
  it('should render a lock badge and stay clickable when modifier is "locked"', async () => {
    const user = userEvent.setup();
    const handleClick = jest.fn();

    render(
      <NavigationDrawerItem
        label="WhatsApp Inbox"
        modifier="locked"
        onClick={handleClick}
      />,
      { wrapper: Wrapper },
    );

    expect(screen.getByText('Bloqueado')).toBeVisible();

    await user.click(screen.getByText('WhatsApp Inbox'));

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('should not render a lock badge when no modifier is set', () => {
    render(<NavigationDrawerItem label="WhatsApp Inbox" to="/whatsapp" />, {
      wrapper: Wrapper,
    });

    expect(screen.queryByText('Bloqueado')).not.toBeInTheDocument();
  });
});
