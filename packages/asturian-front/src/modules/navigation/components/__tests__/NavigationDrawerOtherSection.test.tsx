import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

import { NavigationDrawerOtherSection } from '@/navigation/components/NavigationDrawerOtherSection';
import { isWhatsappMessagingEnabledState } from '@/client-config/states/isWhatsappMessagingEnabledState';
import { type WorkspaceModule } from '@/workspace/types/WorkspaceModuleEntitlement';
import { getJestMetadataAndApolloMocksWrapper } from '~/testing/jest/getJestMetadataAndApolloMocksWrapper';

// getJestMetadataAndApolloMocksWrapper doesn't provide an I18nProvider, but
// NavigationDrawerOtherSection uses useLingui() internally, so we need to
// supply one here. setupTests.ts already loads/activates the shared i18n
// singleton for the process.

const mockOpenUpsellModal = jest.fn();
let mockIsLocked = false;

jest.mock('@/workspace/hooks/useModuleAccessGate', () => ({
  useModuleAccessGate: (module: WorkspaceModule) => ({
    hasAccess: !mockIsLocked,
    isLocked: mockIsLocked,
    // Use the real id helper so a change to the id format breaks this test.
    modalInstanceId: jest
      .requireActual<typeof import('@/workspace/hooks/useModuleAccessGate')>(
        '@/workspace/hooks/useModuleAccessGate',
      )
      .getModuleAccessGateModalId(module),
    openUpsellModal: mockOpenUpsellModal,
  }),
}));

jest.mock('~/hooks/useNavigateSettings', () => ({
  useNavigateSettings: () => jest.fn(),
}));

const renderSection = () => {
  const Wrapper = getJestMetadataAndApolloMocksWrapper({
    apolloMocks: [],
    onInitializeJotaiStore: (store) => {
      store.set(isWhatsappMessagingEnabledState.atom, true);
    },
  });

  return render(
    <I18nProvider i18n={i18n}>
      <MemoryRouter>
        <NavigationDrawerOtherSection />
      </MemoryRouter>
    </I18nProvider>,
    { wrapper: Wrapper },
  );
};

describe('NavigationDrawerOtherSection', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockIsLocked = false;
  });

  it('should render the WhatsApp Inbox item as a normal link when the module is contracted', () => {
    renderSection();

    expect(screen.getByText('WhatsApp Inbox')).toBeInTheDocument();
    expect(screen.queryByText('Bloqueado')).not.toBeInTheDocument();
  });

  it('should render the WhatsApp Inbox item locked and open the upsell modal on click when the module is not contracted', async () => {
    mockIsLocked = true;
    const user = userEvent.setup();

    renderSection();

    expect(screen.getByText('Bloqueado')).toBeInTheDocument();

    await user.click(screen.getByText('WhatsApp Inbox'));

    expect(mockOpenUpsellModal).toHaveBeenCalledTimes(1);
  });
});
