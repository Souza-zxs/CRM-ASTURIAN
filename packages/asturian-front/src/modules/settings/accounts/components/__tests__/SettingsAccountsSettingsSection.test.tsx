import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

import { SettingsAccountsSettingsSection } from '@/settings/accounts/components/SettingsAccountsSettingsSection';
import { isInstagramMessagingEnabledState } from '@/client-config/states/isInstagramMessagingEnabledState';
import { isVoiceAgentEnabledState } from '@/client-config/states/isVoiceAgentEnabledState';
import { isWhatsappAiAgentEnabledState } from '@/client-config/states/isWhatsappAiAgentEnabledState';
import { isWhatsappMessagingEnabledState } from '@/client-config/states/isWhatsappMessagingEnabledState';
import { type WorkspaceModule } from '@/workspace/types/WorkspaceModuleEntitlement';
import { getJestMetadataAndApolloMocksWrapper } from '~/testing/jest/getJestMetadataAndApolloMocksWrapper';
import { I18nProvider } from '@lingui/react';
import { i18n } from '@lingui/core';

const mockOpenUpsellModal = jest.fn();
let mockLockedModules: Partial<Record<WorkspaceModule, boolean>> = {};

jest.mock('@/workspace/hooks/useModuleAccessGate', () => ({
  useModuleAccessGate: (module: WorkspaceModule) => ({
    hasAccess: !mockLockedModules[module],
    isLocked: !!mockLockedModules[module],
    // Use the real id helper so a change to the id format breaks this test.
    modalInstanceId: jest
      .requireActual<typeof import('@/workspace/hooks/useModuleAccessGate')>(
        '@/workspace/hooks/useModuleAccessGate',
      )
      .getModuleAccessGateModalId(module),
    openUpsellModal: () => mockOpenUpsellModal(module),
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
      store.set(isInstagramMessagingEnabledState.atom, true);
      store.set(isVoiceAgentEnabledState.atom, true);
      store.set(isWhatsappAiAgentEnabledState.atom, true);
    },
  });

  return render(
    <I18nProvider i18n={i18n}>
      <MemoryRouter>
        <SettingsAccountsSettingsSection />
      </MemoryRouter>
    </I18nProvider>,
    { wrapper: Wrapper },
  );
};

describe('SettingsAccountsSettingsSection', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockLockedModules = {};
  });

  it('should render every card unlocked when all modules are contracted', () => {
    renderSection();

    expect(screen.queryByText('Bloqueado')).not.toBeInTheDocument();
  });

  it('should lock the Instagram card and open the MANYCHAT_LIKE upsell modal on click, without affecting the unlocked WhatsApp card', async () => {
    mockLockedModules = { INSTAGRAM: true, MANYCHAT_LIKE: true };
    const user = userEvent.setup();

    renderSection();

    expect(screen.getAllByText('Bloqueado')).toHaveLength(1);

    await user.click(screen.getByText('Instagram'));

    expect(mockOpenUpsellModal).toHaveBeenCalledWith('MANYCHAT_LIKE');

    // The locked card is a plain div, so it must carry button semantics to
    // stay reachable without a mouse.
    const lockedCard = screen.getByText('Instagram').closest('[tabindex]');

    expect(lockedCard).toHaveAttribute('tabindex', '0');
    expect(lockedCard).toHaveAttribute('role', 'button');
  });

  it('should keep the Instagram card unlocked when only INSTAGRAM is contracted, since it also hosts channel management', async () => {
    mockLockedModules = { MANYCHAT_LIKE: true };
    const user = userEvent.setup();

    renderSection();

    expect(screen.queryByText('Bloqueado')).not.toBeInTheDocument();

    const instagramCard = screen.getByText('Instagram');

    expect(instagramCard.closest('a')).toHaveAttribute(
      'href',
      '/settings/accounts/instagram',
    );

    await user.click(instagramCard);

    expect(mockOpenUpsellModal).not.toHaveBeenCalled();
  });

  it('should lock both WhatsApp cards together since they share the same module', () => {
    mockLockedModules = { WHATSAPP: true };

    renderSection();

    expect(screen.getAllByText('Bloqueado')).toHaveLength(2);
  });
});
