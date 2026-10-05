import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

import { SettingsAccountsSettingsSection } from '@/settings/accounts/components/SettingsAccountsSettingsSection';
import { isInstagramMessagingEnabledState } from '@/client-config/states/isInstagramMessagingEnabledState';
import { isVoiceAgentEnabledState } from '@/client-config/states/isVoiceAgentEnabledState';
import { isWhatsappAiAgentEnabledState } from '@/client-config/states/isWhatsappAiAgentEnabledState';
import { isWhatsappMessagingEnabledState } from '@/client-config/states/isWhatsappMessagingEnabledState';
import { getJestMetadataAndApolloMocksWrapper } from '~/testing/jest/getJestMetadataAndApolloMocksWrapper';
import { I18nProvider } from '@lingui/react';
import { i18n } from '@lingui/core';

const mockOpenUpsellModal = jest.fn();
let mockLockedModules: Record<string, boolean> = {};

jest.mock('@/workspace/hooks/useModuleAccessGate', () => ({
  useModuleAccessGate: (module: string) => ({
    hasAccess: !mockLockedModules[module],
    isLocked: !!mockLockedModules[module],
    modalInstanceId: `module-access-gate-${module}`,
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
    mockLockedModules = { MANYCHAT_LIKE: true };
    const user = userEvent.setup();

    renderSection();

    expect(screen.getAllByText('Bloqueado')).toHaveLength(1);

    await user.click(screen.getByText('Instagram'));

    expect(mockOpenUpsellModal).toHaveBeenCalledWith('MANYCHAT_LIKE');
  });

  it('should lock both WhatsApp cards together since they share the same module', () => {
    mockLockedModules = { WHATSAPP: true };

    renderSection();

    expect(screen.getAllByText('Bloqueado')).toHaveLength(2);
  });
});
