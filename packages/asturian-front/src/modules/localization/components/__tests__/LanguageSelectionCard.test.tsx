import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { LanguageSelectionCard } from '@/localization/components/LanguageSelectionCard';
import {
  jotaiStore,
  resetJotaiStore,
} from '@/ui/utilities/state/jotai/jotaiStore';
import { MockedProvider } from '@apollo/client/testing/react';
import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider as JotaiProvider } from 'jotai';
import { type ReactNode } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { SOURCE_LOCALE } from 'zyra-shared/translations';
import { messages } from '~/locales/generated/en';

i18n.load({ [SOURCE_LOCALE]: messages });
i18n.activate(SOURCE_LOCALE);

// The real picker pulls in metadata/GraphQL machinery this test doesn't
// need — only that the card renders it and offers a way to dismiss.
jest.mock(
  '~/pages/settings/profile/appearance/components/LocalePicker',
  () => ({
    LocalePicker: () => <div>locale picker</div>,
  }),
);

const mockWorkspaceMember = {
  id: 'member-1',
  name: { firstName: 'Maria', lastName: 'Silva' },
  locale: 'en',
} as never;

const Wrapper = ({ children }: { children: ReactNode }) => (
  <MockedProvider>
    <JotaiProvider store={jotaiStore}>
      <MemoryRouter>
        <I18nProvider i18n={i18n}>{children}</I18nProvider>
      </MemoryRouter>
    </JotaiProvider>
  </MockedProvider>
);

describe('LanguageSelectionCard', () => {
  beforeEach(() => {
    resetJotaiStore();
    window.localStorage.clear();
  });

  it('should render nothing before the workspace member loads', () => {
    render(<LanguageSelectionCard />, { wrapper: Wrapper });

    expect(screen.queryByText('locale picker')).not.toBeInTheDocument();
  });

  it('should open the card the first time a member is seen', () => {
    jotaiStore.set(currentWorkspaceMemberState.atom, mockWorkspaceMember);

    render(<LanguageSelectionCard />, { wrapper: Wrapper });

    expect(screen.getByText('locale picker')).toBeInTheDocument();
  });

  it('should not reopen for a member who already dismissed it', () => {
    window.localStorage.setItem(
      'language-selection-card-dismissed:member-1',
      'true',
    );
    jotaiStore.set(currentWorkspaceMemberState.atom, mockWorkspaceMember);

    render(<LanguageSelectionCard />, { wrapper: Wrapper });

    expect(screen.queryByText('locale picker')).not.toBeInTheDocument();
  });

  it('should dismiss and remember the choice when Continue is clicked', async () => {
    const user = userEvent.setup();

    jotaiStore.set(currentWorkspaceMemberState.atom, mockWorkspaceMember);

    render(<LanguageSelectionCard />, { wrapper: Wrapper });
    await user.click(screen.getByText('Continue'));

    expect(screen.queryByText('locale picker')).not.toBeInTheDocument();
    expect(
      window.localStorage.getItem(
        'language-selection-card-dismissed:member-1',
      ),
    ).toBe('true');
  });
});
