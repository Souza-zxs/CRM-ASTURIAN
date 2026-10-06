# Itens de nav/Settings travados por módulo pago — Plano de Implementação

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fazer os itens de nav/Settings ligados a módulos pagos (WhatsApp, Instagram/Manychat-like,
Voice Agent, AI Agent) ficarem sempre visíveis, mas travados (com modal de upsell) até o workspace
contratar o módulo — hoje eles só checam uma flag global de instância, nunca o módulo pago do
workspace.

**Architecture:** Um hook fino (`useModuleAccessGate`) combina a entitlement já exposta
(`useWorkspaceModules().hasModule()`) com a abertura de um modal já existente
(`ModuleLimitBlockedModal`, ainda não conectado em nenhum lugar). O `NavigationDrawerItem` ganha um
novo `modifier="locked"` (visual parecido com `"soon"`, mas clicável). O `SettingsCard` não precisa
de mudança — já suporta `Status` (selo) e `onClick` customizado. Os 6 pontos de uso existentes
(sidebar + cards de Settings) passam a decidir entre a versão travada e a versão normal.

**Tech Stack:** React 18, TypeScript, Jotai, Apollo Client, Lingui, Linaria, Jest + React Testing
Library (front). NestJS + TypeORM, instance command slow (backend).

## Global Constraints

- Sem tipo `any`; só exports nomeados; types em vez de interfaces; sem abreviações em nomes.
- `t` (lingui) usa texto em português diretamente no código-fonte, igual ao resto do arquivo onde
  cada string vive (ex.: `ModuleLimitBlockedModal.tsx` já usa PT-BR dentro de `t\`...\``).
- Nenhuma mudança na checagem de backend (já gateada corretamente nos resolvers) — este plano é só
  visual/frontend + a instance command do Horizon.
- **Fluxo de entrega**: nenhum merge direto em `master` nem deploy em produção. Todo o trabalho vai
  para um PR; só depois de revisão/aprovação é que entra em produção. Commits intermediários podem
  continuar na branch atual (`plan-tier-and-workshop-automations`) ou numa branch nova — não dar
  push em `master` nem rodar deploy do Vercel/VPS como parte desta execução.
- Specs: `docs/superpowers/specs/2026-10-05-paid-module-locked-nav-items-design.md`.

---

## Task 1: `useModuleAccessGate` hook

**Files:**
- Create: `packages/asturian-front/src/modules/workspace/hooks/useModuleAccessGate.ts`
- Test: `packages/asturian-front/src/modules/workspace/hooks/__tests__/useModuleAccessGate.test.ts`

**Interfaces:**
- Consumes: `useWorkspaceModules()` from `@/workspace/hooks/useWorkspaceModules` →
  `{ modules, loading: boolean, hasModule: (module: WorkspaceModule) => boolean }` (already exists,
  unchanged). `useModal()` from `@/ui/layout/modal/hooks/useModal` →
  `{ openModal: (modalInstanceId: string) => void, closeModal, toggleModal }` (already exists,
  unchanged). `WorkspaceModule` type from `@/workspace/types/WorkspaceModuleEntitlement`.
- Produces: `getModuleAccessGateModalId(module: WorkspaceModule): string` and
  `useModuleAccessGate(module: WorkspaceModule): { hasAccess: boolean; isLocked: boolean;
  modalInstanceId: string; openUpsellModal: () => void }`. Tasks 3 and 4 import both.

- [ ] **Step 1: Write the failing test**

```ts
import { renderHook } from '@testing-library/react';

import { useModuleAccessGate } from '@/workspace/hooks/useModuleAccessGate';

const mockUseWorkspaceModules = jest.fn();
const mockOpenModal = jest.fn();

jest.mock('@/workspace/hooks/useWorkspaceModules', () => ({
  useWorkspaceModules: () => mockUseWorkspaceModules(),
}));

jest.mock('@/ui/layout/modal/hooks/useModal', () => ({
  useModal: () => ({
    openModal: mockOpenModal,
    closeModal: jest.fn(),
    toggleModal: jest.fn(),
  }),
}));

describe('useModuleAccessGate', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return hasAccess true and isLocked false when the workspace has the module', () => {
    mockUseWorkspaceModules.mockReturnValue({
      modules: [],
      loading: false,
      hasModule: (module: string) => module === 'WHATSAPP',
    });

    const { result } = renderHook(() => useModuleAccessGate('WHATSAPP'));

    expect(result.current.hasAccess).toBe(true);
    expect(result.current.isLocked).toBe(false);
  });

  it('should return hasAccess false and isLocked true when the workspace does not have the module', () => {
    mockUseWorkspaceModules.mockReturnValue({
      modules: [],
      loading: false,
      hasModule: () => false,
    });

    const { result } = renderHook(() => useModuleAccessGate('WHATSAPP'));

    expect(result.current.hasAccess).toBe(false);
    expect(result.current.isLocked).toBe(true);
  });

  it('should treat a still-loading entitlement query as not locked', () => {
    mockUseWorkspaceModules.mockReturnValue({
      modules: [],
      loading: true,
      hasModule: () => false,
    });

    const { result } = renderHook(() => useModuleAccessGate('WHATSAPP'));

    expect(result.current.isLocked).toBe(false);
  });

  it('should open the upsell modal scoped to this module when openUpsellModal is called', () => {
    mockUseWorkspaceModules.mockReturnValue({
      modules: [],
      loading: false,
      hasModule: () => false,
    });

    const { result } = renderHook(() => useModuleAccessGate('WHATSAPP'));
    result.current.openUpsellModal();

    expect(mockOpenModal).toHaveBeenCalledWith('module-access-gate-WHATSAPP');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run (from repo root): `cd packages/asturian-front && npx jest useModuleAccessGate.test.ts --config=jest.config.mjs`
Expected: FAIL with "Cannot find module '@/workspace/hooks/useModuleAccessGate'".

- [ ] **Step 3: Write minimal implementation**

```ts
import { useModal } from '@/ui/layout/modal/hooks/useModal';
import { useWorkspaceModules } from '@/workspace/hooks/useWorkspaceModules';
import { type WorkspaceModule } from '@/workspace/types/WorkspaceModuleEntitlement';

export const getModuleAccessGateModalId = (module: WorkspaceModule): string =>
  `module-access-gate-${module}`;

export const useModuleAccessGate = (module: WorkspaceModule) => {
  const { hasModule, loading } = useWorkspaceModules();
  const { openModal } = useModal();

  const hasAccess = loading || hasModule(module);
  const isLocked = !hasAccess;
  const modalInstanceId = getModuleAccessGateModalId(module);

  const openUpsellModal = () => {
    openModal(modalInstanceId);
  };

  return { hasAccess, isLocked, modalInstanceId, openUpsellModal };
};
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd packages/asturian-front && npx jest useModuleAccessGate.test.ts --config=jest.config.mjs`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add packages/asturian-front/src/modules/workspace/hooks/useModuleAccessGate.ts packages/asturian-front/src/modules/workspace/hooks/__tests__/useModuleAccessGate.test.ts
git commit -m "feat: add useModuleAccessGate hook for paid-module nav gating"
```

---

## Task 2: `'locked'` modifier on `NavigationDrawerItem`

**Files:**
- Modify: `packages/asturian-front/src/modules/ui/navigation/navigation-drawer/components/NavigationDrawerItem.tsx`
- Test: `packages/asturian-front/src/modules/ui/navigation/navigation-drawer/components/__tests__/NavigationDrawerItem.test.tsx`

**Interfaces:**
- Consumes: nothing new (self-contained visual change to an existing component).
- Produces: `NavigationDrawerItemModifier` now includes `'locked'` (was `'soon' | 'new' |
  {keyboard}`). When `modifier="locked"`, the item renders a `Pill` with a lock icon and label
  `"Bloqueado"`, dims like `"soon"`, but stays fully clickable (`cursor: pointer`, `pointer-events:
  auto` — unlike `"soon"`, which disables both). Tasks 3 and 4 pass `modifier="locked"` + `onClick`
  (no `to`) when a module is locked.

- [ ] **Step 1: Write the failing test**

```tsx
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd packages/asturian-front && npx jest NavigationDrawerItem.test.tsx --config=jest.config.mjs`
Expected: FAIL — "Bloqueado" text not found (modifier `'locked'` not yet handled; TypeScript will
also reject the `modifier="locked"` prop value until Step 3).

- [ ] **Step 3: Write minimal implementation**

In `NavigationDrawerItem.tsx`:

1. Extend the modifier type:

```ts
export type NavigationDrawerItemModifier =
  | 'soon'
  | 'new'
  | 'locked'
  | { keyboard: string[] };
```

2. Add `IconLock` to the existing icon import:

```ts
import { IconLock, type IconComponent, type TablerIconsProps } from 'zyra-ui/icon';
```

3. Add `isLocked` to `StyledItemProps` and the styled component's color logic:

```ts
type StyledItemProps = Pick<
  NavigationDrawerItemProps,
  | 'active'
  | 'indentationLevel'
  | 'to'
  | 'isDragging'
  | 'isSelectedInEditMode'
  | 'variant'
> & {
  isSoon: boolean;
  isLocked: boolean;
  isNavigationDrawerExpanded: boolean;
  hasRightOptions: boolean;
  href?: string;
  target?: string;
  rel?: string;
};
```

```ts
  color: ${({ active, isSoon, isLocked, variant }) => {
    if (variant === 'tertiary') {
      return themeCssVariables.font.color.tertiary;
    }
    if (active === true) {
      return themeCssVariables.font.color.primary;
    }
    if (isSoon || isLocked) {
      return themeCssVariables.font.color.light;
    }
    return themeCssVariables.font.color.secondary;
  }};
```

(leave the existing `cursor`/`pointer-events` rules as-is — they already key only on `isSoon`, so a
locked item keeps the default `pointer`/`auto` values, which is what makes it clickable.)

4. In the component body, derive `isLocked` alongside the existing `isSoon`/`isNew`:

```ts
  const isSoon = modifier === 'soon';
  const isNew = modifier === 'new';
  const isLocked = modifier === 'locked';
```

5. Pass `isLocked={isLocked}` to `<StyledItem ...>` (alongside the existing `isSoon={isSoon}`).

6. Render the lock pill, right after the existing `isNew` block:

```tsx
          {isLocked && (
            <NavigationDrawerAnimatedCollapseWrapper>
              <Pill Icon={IconLock} label={t`Bloqueado`} />
            </NavigationDrawerAnimatedCollapseWrapper>
          )}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd packages/asturian-front && npx jest NavigationDrawerItem.test.tsx --config=jest.config.mjs`
Expected: PASS (2 tests).

- [ ] **Step 5: Typecheck the file (this component is shared app-wide)**

Run: `cd packages/asturian-front && npx tsgo --noEmit -p tsconfig.json 2>&1 | grep NavigationDrawerItem.tsx`
Expected: no output (no errors referencing this file). Per project notes, a full `tsgo --noEmit` run
on this package prints unrelated noise (zyra-ui not built locally) — filter to this file only.

- [ ] **Step 6: Commit**

```bash
git add packages/asturian-front/src/modules/ui/navigation/navigation-drawer/components/NavigationDrawerItem.tsx packages/asturian-front/src/modules/ui/navigation/navigation-drawer/components/__tests__/NavigationDrawerItem.test.tsx
git commit -m "feat: add locked modifier to NavigationDrawerItem"
```

---

## Task 3: Wire `NavigationDrawerOtherSection` (WhatsApp Inbox)

**Files:**
- Modify: `packages/asturian-front/src/modules/navigation/components/NavigationDrawerOtherSection.tsx`
- Test: `packages/asturian-front/src/modules/navigation/components/__tests__/NavigationDrawerOtherSection.test.tsx`

**Interfaces:**
- Consumes: `useModuleAccessGate('WHATSAPP')` from Task 1 → `{ isLocked, modalInstanceId,
  openUpsellModal }`; `modifier="locked"` from Task 2; `ModuleLimitBlockedModal` (already exists,
  unmodified) from `@/workspace/components/ModuleLimitBlockedModal`, props `{ modalInstanceId:
  string, featureName: string }`.
- Produces: no new exports — this is a leaf UI wiring change.

- [ ] **Step 1: Write the failing test**

```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

import { NavigationDrawerOtherSection } from '@/navigation/components/NavigationDrawerOtherSection';
import { isWhatsappMessagingEnabledState } from '@/client-config/states/isWhatsappMessagingEnabledState';
import { getJestMetadataAndApolloMocksWrapper } from '~/testing/jest/getJestMetadataAndApolloMocksWrapper';

const mockOpenUpsellModal = jest.fn();
let mockIsLocked = false;

jest.mock('@/workspace/hooks/useModuleAccessGate', () => ({
  useModuleAccessGate: () => ({
    hasAccess: !mockIsLocked,
    isLocked: mockIsLocked,
    modalInstanceId: 'module-access-gate-WHATSAPP',
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
    <MemoryRouter>
      <NavigationDrawerOtherSection />
    </MemoryRouter>,
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd packages/asturian-front && npx jest NavigationDrawerOtherSection.test.tsx --config=jest.config.mjs`
Expected: FAIL — "Bloqueado" never appears (component doesn't call `useModuleAccessGate` yet), and/or
"Cannot find module '@/workspace/hooks/useModuleAccessGate'" error from the `jest.mock` call if the
file from Task 1 isn't present (it is, from Task 1 — the failure here is behavioral, not a missing
module).

- [ ] **Step 3: Write minimal implementation**

Replace the full contents of `NavigationDrawerOtherSection.tsx` with:

```tsx
import { useLingui } from '@lingui/react/macro';
import { useMatch } from 'react-router-dom';
import { AppPath, SettingsPath } from 'zyra-shared/types';
import { IconBrandWhatsapp, IconHelpCircle, IconSettings } from 'zyra-ui/icon';
import { AnimatedExpandableContainer } from 'zyra-ui/layout';

import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { isWhatsappMessagingEnabledState } from '@/client-config/states/isWhatsappMessagingEnabledState';
import { getDocumentationUrl } from '@/support/utils/getDocumentationUrl';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { ModuleLimitBlockedModal } from '@/workspace/components/ModuleLimitBlockedModal';
import { useModuleAccessGate } from '@/workspace/hooks/useModuleAccessGate';

import { NavigationDrawerAnimatedCollapseWrapper } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerAnimatedCollapseWrapper';
import { NavigationDrawerItem } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerItem';
import { NavigationDrawerSection } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerSection';
import { NavigationDrawerSectionTitle } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerSectionTitle';
import { useNavigationSection } from '@/ui/navigation/navigation-drawer/hooks/useNavigationSection';
import { isNavigationSectionOpenFamilyState } from '@/ui/navigation/navigation-drawer/states/isNavigationSectionOpenFamilyState';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';

export const NavigationDrawerOtherSection = () => {
  const { t } = useLingui();
  const navigateSettings = useNavigateSettings();
  const currentWorkspaceMember = useAtomStateValue(currentWorkspaceMemberState);
  const isWhatsappMessagingEnabled = useAtomStateValue(
    isWhatsappMessagingEnabledState,
  );
  const isWhatsappInboxActive = useMatch(AppPath.WhatsappInbox) !== null;
  const {
    isLocked: isWhatsappLocked,
    modalInstanceId: whatsappModalInstanceId,
    openUpsellModal: openWhatsappUpsellModal,
  } = useModuleAccessGate('WHATSAPP');

  const { toggleNavigationSection } = useNavigationSection('Other');
  const isNavigationSectionOpen = useAtomFamilyStateValue(
    isNavigationSectionOpenFamilyState,
    'Other',
  );

  const handleSettingsClick = () => {
    navigateSettings(SettingsPath.ProfilePage);
  };

  return (
    <NavigationDrawerSection>
      <NavigationDrawerAnimatedCollapseWrapper>
        <NavigationDrawerSectionTitle
          label={t`Other`}
          onClick={toggleNavigationSection}
          isOpen={isNavigationSectionOpen}
        />
      </NavigationDrawerAnimatedCollapseWrapper>
      <AnimatedExpandableContainer
        isExpanded={isNavigationSectionOpen}
        dimension="height"
        mode="fit-content"
        containAnimation
        initial={false}
      >
        {isWhatsappMessagingEnabled && (
          <>
            {isWhatsappLocked ? (
              <NavigationDrawerItem
                label={t`WhatsApp Inbox`}
                modifier="locked"
                Icon={IconBrandWhatsapp}
                onClick={openWhatsappUpsellModal}
              />
            ) : (
              <NavigationDrawerItem
                label={t`WhatsApp Inbox`}
                to={AppPath.WhatsappInbox}
                active={isWhatsappInboxActive}
                Icon={IconBrandWhatsapp}
              />
            )}
            <ModuleLimitBlockedModal
              modalInstanceId={whatsappModalInstanceId}
              featureName={t`WhatsApp`}
            />
          </>
        )}
        <NavigationDrawerItem
          label={t`Settings`}
          Icon={IconSettings}
          onClick={handleSettingsClick}
        />
        <NavigationDrawerItem
          label={t`Documentation`}
          to={getDocumentationUrl({
            locale: currentWorkspaceMember?.locale,
          })}
          Icon={IconHelpCircle}
        />
      </AnimatedExpandableContainer>
    </NavigationDrawerSection>
  );
};
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd packages/asturian-front && npx jest NavigationDrawerOtherSection.test.tsx --config=jest.config.mjs`
Expected: PASS (2 tests).

- [ ] **Step 5: Commit**

```bash
git add packages/asturian-front/src/modules/navigation/components/NavigationDrawerOtherSection.tsx packages/asturian-front/src/modules/navigation/components/__tests__/NavigationDrawerOtherSection.test.tsx
git commit -m "feat: lock WhatsApp Inbox nav item until the module is contracted"
```

---

## Task 4: Wire `SettingsAccountsSettingsSection` (5 cards)

**Files:**
- Modify: `packages/asturian-front/src/modules/settings/accounts/components/SettingsAccountsSettingsSection.tsx`
- Test: `packages/asturian-front/src/modules/settings/accounts/components/__tests__/SettingsAccountsSettingsSection.test.tsx`

**Interfaces:**
- Consumes: `useModuleAccessGate` (Task 1) called 4 times — `'WHATSAPP'` (shared by the WhatsApp and
  WhatsApp Templates cards), `'MANYCHAT_LIKE'` (Instagram card — label stays "Instagram", gate uses
  this module per the spec decision), `'VOICE_AGENT'`, `'AI_AGENT'`. `ModuleLimitBlockedModal`
  (unmodified). `SettingsCard`'s existing `Status`/`onClick` props (unmodified).
- Produces: no new exports — leaf UI wiring change.

- [ ] **Step 1: Write the failing test**

```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { SettingsAccountsSettingsSection } from '@/settings/accounts/components/SettingsAccountsSettingsSection';
import { isInstagramMessagingEnabledState } from '@/client-config/states/isInstagramMessagingEnabledState';
import { isVoiceAgentEnabledState } from '@/client-config/states/isVoiceAgentEnabledState';
import { isWhatsappAiAgentEnabledState } from '@/client-config/states/isWhatsappAiAgentEnabledState';
import { isWhatsappMessagingEnabledState } from '@/client-config/states/isWhatsappMessagingEnabledState';
import { getJestMetadataAndApolloMocksWrapper } from '~/testing/jest/getJestMetadataAndApolloMocksWrapper';

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

  return render(<SettingsAccountsSettingsSection />, { wrapper: Wrapper });
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd packages/asturian-front && npx jest SettingsAccountsSettingsSection.test.tsx --config=jest.config.mjs`
Expected: FAIL — every card renders unlocked regardless of `mockLockedModules` (component doesn't
call `useModuleAccessGate` yet).

- [ ] **Step 3: Write minimal implementation**

Replace the full contents of `SettingsAccountsSettingsSection.tsx` with:

```tsx
import { styled } from '@linaria/react';
import { useContext } from 'react';

import { isInstagramMessagingEnabledState } from '@/client-config/states/isInstagramMessagingEnabledState';
import { isVoiceAgentEnabledState } from '@/client-config/states/isVoiceAgentEnabledState';
import { isWhatsappAiAgentEnabledState } from '@/client-config/states/isWhatsappAiAgentEnabledState';
import { isWhatsappMessagingEnabledState } from '@/client-config/states/isWhatsappMessagingEnabledState';
import { SettingsCard } from '@/settings/components/SettingsCard';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { ModuleLimitBlockedModal } from '@/workspace/components/ModuleLimitBlockedModal';
import { useModuleAccessGate } from '@/workspace/hooks/useModuleAccessGate';
import { useLingui } from '@lingui/react/macro';
import { SettingsPath } from 'zyra-shared/types';
import { getSettingsPath } from 'zyra-shared/utils';
import { Pill } from 'zyra-ui/data-display';
import {
  IconBrandInstagram,
  IconBrandWhatsapp,
  IconCalendarEvent,
  IconFileText,
  IconLock,
  IconMailCog,
  IconPhone,
  IconRobot,
} from 'zyra-ui/icon';
import { H2Title } from 'zyra-ui/typography';
import { Section } from 'zyra-ui/layout';
import { UndecoratedLink } from 'zyra-ui/navigation';
import {
  MOBILE_VIEWPORT,
  ThemeContext,
  themeCssVariables,
} from 'zyra-ui/theme-constants';

const StyledCardsContainer = styled.div`
  display: flex;
  gap: ${themeCssVariables.spacing[4]};
  margin-top: ${themeCssVariables.spacing[6]};

  @media (max-width: ${MOBILE_VIEWPORT}px) {
    flex-direction: column;
  }
`;

const StyledCardLinkSlot = styled.div`
  flex: 1 1 0;
  min-width: 0;
`;

export const SettingsAccountsSettingsSection = () => {
  const { theme } = useContext(ThemeContext);
  const { t } = useLingui();
  const isWhatsappMessagingEnabled = useAtomStateValue(
    isWhatsappMessagingEnabledState,
  );
  const isInstagramMessagingEnabled = useAtomStateValue(
    isInstagramMessagingEnabledState,
  );
  const isVoiceAgentEnabled = useAtomStateValue(isVoiceAgentEnabledState);
  const isWhatsappAiAgentEnabled = useAtomStateValue(
    isWhatsappAiAgentEnabledState,
  );

  const whatsappGate = useModuleAccessGate('WHATSAPP');
  const manychatLikeGate = useModuleAccessGate('MANYCHAT_LIKE');
  const voiceAgentGate = useModuleAccessGate('VOICE_AGENT');
  const aiAgentGate = useModuleAccessGate('AI_AGENT');

  const lockedStatus = <Pill Icon={IconLock} label={t`Bloqueado`} />;

  return (
    <Section>
      <H2Title
        title={t`Settings`}
        description={t`Configure your emails and calendar settings.`}
      />
      <StyledCardsContainer>
        <StyledCardLinkSlot>
          <UndecoratedLink to={getSettingsPath(SettingsPath.AccountsEmails)}>
            <SettingsCard
              Icon={
                <IconMailCog
                  size={theme.icon.size.lg}
                  stroke={theme.icon.stroke.sm}
                />
              }
              title={t`Emails`}
              description={t`Set email visibility, manage your blocklist and more.`}
            />
          </UndecoratedLink>
        </StyledCardLinkSlot>
        <StyledCardLinkSlot>
          <UndecoratedLink to={getSettingsPath(SettingsPath.AccountsCalendars)}>
            <SettingsCard
              Icon={
                <IconCalendarEvent
                  size={theme.icon.size.lg}
                  stroke={theme.icon.stroke.sm}
                />
              }
              title={t`Calendar`}
              description={t`Configure and customize your calendar preferences.`}
            />
          </UndecoratedLink>
        </StyledCardLinkSlot>
        {isWhatsappMessagingEnabled && (
          <StyledCardLinkSlot>
            {whatsappGate.isLocked ? (
              <SettingsCard
                Icon={
                  <IconBrandWhatsapp
                    size={theme.icon.size.lg}
                    stroke={theme.icon.stroke.sm}
                  />
                }
                title={t`WhatsApp`}
                description={t`Manage your connected WhatsApp numbers.`}
                Status={lockedStatus}
                onClick={whatsappGate.openUpsellModal}
              />
            ) : (
              <UndecoratedLink
                to={getSettingsPath(SettingsPath.AccountsWhatsapp)}
              >
                <SettingsCard
                  Icon={
                    <IconBrandWhatsapp
                      size={theme.icon.size.lg}
                      stroke={theme.icon.stroke.sm}
                    />
                  }
                  title={t`WhatsApp`}
                  description={t`Manage your connected WhatsApp numbers.`}
                />
              </UndecoratedLink>
            )}
          </StyledCardLinkSlot>
        )}
        {isWhatsappMessagingEnabled && (
          <StyledCardLinkSlot>
            {whatsappGate.isLocked ? (
              <SettingsCard
                Icon={
                  <IconFileText
                    size={theme.icon.size.lg}
                    stroke={theme.icon.stroke.sm}
                  />
                }
                title={t`WhatsApp Templates`}
                description={t`Create and submit message templates for Meta's approval.`}
                Status={lockedStatus}
                onClick={whatsappGate.openUpsellModal}
              />
            ) : (
              <UndecoratedLink
                to={getSettingsPath(SettingsPath.AccountsWhatsappTemplates)}
              >
                <SettingsCard
                  Icon={
                    <IconFileText
                      size={theme.icon.size.lg}
                      stroke={theme.icon.stroke.sm}
                    />
                  }
                  title={t`WhatsApp Templates`}
                  description={t`Create and submit message templates for Meta's approval.`}
                />
              </UndecoratedLink>
            )}
          </StyledCardLinkSlot>
        )}
        {isWhatsappMessagingEnabled && (
          <ModuleLimitBlockedModal
            modalInstanceId={whatsappGate.modalInstanceId}
            featureName={t`WhatsApp`}
          />
        )}
        {isInstagramMessagingEnabled && (
          <StyledCardLinkSlot>
            {manychatLikeGate.isLocked ? (
              <SettingsCard
                Icon={
                  <IconBrandInstagram
                    size={theme.icon.size.lg}
                    stroke={theme.icon.stroke.sm}
                  />
                }
                title={t`Instagram`}
                description={t`Manage comment-to-DM automation rules.`}
                Status={lockedStatus}
                onClick={manychatLikeGate.openUpsellModal}
              />
            ) : (
              <UndecoratedLink
                to={getSettingsPath(SettingsPath.AccountsInstagram)}
              >
                <SettingsCard
                  Icon={
                    <IconBrandInstagram
                      size={theme.icon.size.lg}
                      stroke={theme.icon.stroke.sm}
                    />
                  }
                  title={t`Instagram`}
                  description={t`Manage comment-to-DM automation rules.`}
                />
              </UndecoratedLink>
            )}
            <ModuleLimitBlockedModal
              modalInstanceId={manychatLikeGate.modalInstanceId}
              featureName={t`Instagram`}
            />
          </StyledCardLinkSlot>
        )}
        {isVoiceAgentEnabled && (
          <StyledCardLinkSlot>
            {voiceAgentGate.isLocked ? (
              <SettingsCard
                Icon={
                  <IconPhone
                    size={theme.icon.size.lg}
                    stroke={theme.icon.stroke.sm}
                  />
                }
                title={t`Voice AI Agent`}
                description={t`Configure AI agents to answer and make phone calls.`}
                Status={lockedStatus}
                onClick={voiceAgentGate.openUpsellModal}
              />
            ) : (
              <UndecoratedLink
                to={getSettingsPath(SettingsPath.AccountsVoiceAgent)}
              >
                <SettingsCard
                  Icon={
                    <IconPhone
                      size={theme.icon.size.lg}
                      stroke={theme.icon.stroke.sm}
                    />
                  }
                  title={t`Voice AI Agent`}
                  description={t`Configure AI agents to answer and make phone calls.`}
                />
              </UndecoratedLink>
            )}
            <ModuleLimitBlockedModal
              modalInstanceId={voiceAgentGate.modalInstanceId}
              featureName={t`Voice AI Agent`}
            />
          </StyledCardLinkSlot>
        )}
        {isWhatsappAiAgentEnabled && (
          <StyledCardLinkSlot>
            {aiAgentGate.isLocked ? (
              <SettingsCard
                Icon={
                  <IconRobot
                    size={theme.icon.size.lg}
                    stroke={theme.icon.stroke.sm}
                  />
                }
                title={t`WhatsApp AI Agent`}
                description={t`Configure AI agents to automatically reply to WhatsApp messages.`}
                Status={lockedStatus}
                onClick={aiAgentGate.openUpsellModal}
              />
            ) : (
              <UndecoratedLink
                to={getSettingsPath(SettingsPath.AccountsWhatsappAgent)}
              >
                <SettingsCard
                  Icon={
                    <IconRobot
                      size={theme.icon.size.lg}
                      stroke={theme.icon.stroke.sm}
                    />
                  }
                  title={t`WhatsApp AI Agent`}
                  description={t`Configure AI agents to automatically reply to WhatsApp messages.`}
                />
              </UndecoratedLink>
            )}
            <ModuleLimitBlockedModal
              modalInstanceId={aiAgentGate.modalInstanceId}
              featureName={t`WhatsApp AI Agent`}
            />
          </StyledCardLinkSlot>
        )}
      </StyledCardsContainer>
    </Section>
  );
};
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd packages/asturian-front && npx jest SettingsAccountsSettingsSection.test.tsx --config=jest.config.mjs`
Expected: PASS (3 tests).

- [ ] **Step 5: Lint the touched files**

Run: `cd packages/asturian-front && npx oxlint src/modules/settings/accounts/components/SettingsAccountsSettingsSection.tsx src/modules/navigation/components/NavigationDrawerOtherSection.tsx src/modules/workspace/hooks/useModuleAccessGate.ts src/modules/ui/navigation/navigation-drawer/components/NavigationDrawerItem.tsx`
Expected: no errors. Per project notes, prefer this direct binary over `nx lint` on Windows.

- [ ] **Step 6: Commit**

```bash
git add packages/asturian-front/src/modules/settings/accounts/components/SettingsAccountsSettingsSection.tsx packages/asturian-front/src/modules/settings/accounts/components/__tests__/SettingsAccountsSettingsSection.test.tsx
git commit -m "feat: lock WhatsApp/Instagram/Voice/AI Agent settings cards until contracted"
```

---

## Task 5: Backend — grant `MANYCHAT_LIKE` to the Horizon workspace

**Files:**
- Create (via generator, see Step 1): `packages/zyra-server/src/database/commands/upgrade-version-command/2-16/2-16-instance-command-slow-<generated-timestamp>-grant-horizon-workspace-manychat-like-module.ts`
- Auto-modified by the same generator (do not hand-edit): `packages/zyra-server/src/database/commands/upgrade-version-command/instance-commands.constant.ts`

**Interfaces:**
- Consumes: `PlanGatedFeature.MANYCHAT_LIKE` from `src/engine/core-modules/plan-tier/enums/plan-gated-feature.enum.ts` (already exists); `RegisteredInstanceCommand` decorator and `SlowInstanceCommand` interface (already exist, same ones the sibling 1803400000000 command uses).
- Produces: nothing consumed by Tasks 1-4 — this is an independent backend change. Only the
  production database is affected, and only once someone runs `database:migrate` on the VPS (not
  part of this task — only the user runs VPS commands).

**Context:** The existing `2-16-instance-command-slow-1803400000000-grant-horizon-workspace-all-modules.ts`
already grants `WHATSAPP` (and 9 other modules) to the Horizon workspace
(`f7a7d81f-b6b3-42f3-8bba-51e74e90af90`), but its `IMPLEMENTED_MODULES` list explicitly excludes
`MANYCHAT_LIKE` — correct at the time it was written, since `MANYCHAT_LIKE` only became
`implemented: true` in `module-catalog.constant.ts` later in the same day. Per the project rule
("nunca reescreva lógica de instance command já commitada"), that file must not be edited — this
task adds a **new** instance command instead.

- [ ] **Step 1: Generate the instance command scaffold**

Run (from repo root):
```bash
npx nx run zyra-server:database:migrate:generate --name grant-horizon-workspace-manychat-like-module --type slow
```

This creates a new file under `packages/zyra-server/src/database/commands/upgrade-version-command/2-16/`
named `2-16-instance-command-slow-<timestamp>-grant-horizon-workspace-manychat-like-module.ts` and
auto-registers the generated class in `instance-commands.constant.ts`. Note the exact generated
filename and class name for the next step (the class name will be
`GrantHorizonWorkspaceManychatLikeModuleSlowInstanceCommand` or very close to it, following the
same PascalCase-from-kebab-case convention as `GrantHorizonWorkspaceAllModulesSlowInstanceCommand`).

- [ ] **Step 2: Replace the generated stub's body**

Open the generated file and replace its contents with:

```ts
import { DataSource, QueryRunner } from 'typeorm';

import { PlanGatedFeature } from 'src/engine/core-modules/plan-tier/enums/plan-gated-feature.enum';
import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { SlowInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/slow-instance-command.interface';

// The one real production workspace on this instance ("Horizon"). Separate
// from 2-16-instance-command-slow-1803400000000-grant-horizon-workspace-all-modules.ts
// (which must not be edited, per project convention) because that command's
// IMPLEMENTED_MODULES list excluded MANYCHAT_LIKE on purpose — it wasn't
// implemented: true in module-catalog.constant.ts yet when that command was
// written. It is now (see docs/superpowers/specs/2026-10-03-manychat-like-and-integrations-design.md),
// so this follow-up command grants it the same way.
const HORIZON_WORKSPACE_ID = 'f7a7d81f-b6b3-42f3-8bba-51e74e90af90';

@RegisteredInstanceCommand('2.16.0', <generated-timestamp>, { type: 'slow' })
export class GrantHorizonWorkspaceManychatLikeModuleSlowInstanceCommand
  implements SlowInstanceCommand
{
  async runDataMigration(dataSource: DataSource): Promise<void> {
    const workspaceExists = await dataSource.query(
      `SELECT 1 FROM "core"."workspace" WHERE "id" = $1`,
      [HORIZON_WORKSPACE_ID],
    );

    if (workspaceExists.length === 0) {
      // Safe no-op on any environment that doesn't have this workspace
      // (e.g. a fresh local/dev database) — this command exists for one
      // specific production workspace only.
      return;
    }

    await dataSource.query(
      `
      INSERT INTO "core"."workspaceModuleGrandfather" ("workspaceId", "module", "reason")
      VALUES ($1, $2, 'explicit grant for the production workspace once MANYCHAT_LIKE became implemented — see docs/superpowers/specs/2026-10-05-paid-module-locked-nav-items-design.md')
      ON CONFLICT ("workspaceId", "module") DO NOTHING
      `,
      [HORIZON_WORKSPACE_ID, PlanGatedFeature.MANYCHAT_LIKE],
    );
  }

  public async up(_queryRunner: QueryRunner): Promise<void> {
    return;
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {
    return;
  }
}
```

Replace `<generated-timestamp>` with the exact numeric timestamp the generator used in the filename
from Step 1 (the decorator's second argument must match the filename exactly, same as every other
file in this directory).

- [ ] **Step 3: Verify the file compiles and is registered**

Run:
```bash
cd packages/zyra-server && npx tsgo --noEmit -p tsconfig.app.json 2>&1 | grep grant-horizon-workspace-manychat-like
```
Expected: no output (no errors referencing this file).

Run:
```bash
grep -n "GrantHorizonWorkspaceManychatLikeModuleSlowInstanceCommand" src/database/commands/upgrade-version-command/instance-commands.constant.ts
```
Expected: two matches (the import line and the array entry) — confirms the generator auto-registered it.

- [ ] **Step 4: Lint the new file**

Run: `cd packages/zyra-server && npx oxlint src/database/commands/upgrade-version-command/2-16/2-16-instance-command-slow-<generated-timestamp>-grant-horizon-workspace-manychat-like-module.ts`
Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add packages/zyra-server/src/database/commands/upgrade-version-command/2-16/2-16-instance-command-slow-<generated-timestamp>-grant-horizon-workspace-manychat-like-module.ts packages/zyra-server/src/database/commands/upgrade-version-command/instance-commands.constant.ts
git commit -m "feat: grant MANYCHAT_LIKE module to the Horizon workspace"
```

**Note for later (not part of this task):** this only takes effect in production once `database:migrate`
(with `--include-slow`, since this is a slow command) runs on the VPS — only the user runs VPS
commands.

---

## After all tasks: open a PR, do not deploy

Per explicit instruction: this feature must not be merged to `master` or deployed directly. Once
Tasks 1-5 are committed:

```bash
git push -u origin plan-tier-and-workshop-automations
gh pr create --title "feat: lock paid-module nav items until contracted" --body "$(cat <<'EOF'
## Summary
- Adds useModuleAccessGate + a locked NavigationDrawerItem modifier so WhatsApp/Instagram
  (Manychat-like)/Voice Agent/AI Agent stay visible in the nav and Settings cards, but locked
  behind an upsell modal until the workspace contracts the module.
- Grants the MANYCHAT_LIKE module to the Horizon workspace via a new instance command (WHATSAPP
  was already covered by an existing one).

## Test plan
- [ ] `npx jest useModuleAccessGate.test.ts NavigationDrawerItem.test.tsx NavigationDrawerOtherSection.test.tsx SettingsAccountsSettingsSection.test.tsx --config=packages/asturian-front/jest.config.mjs`
- [ ] Manual: toggle a workspace without the WhatsApp module contracted, confirm the WhatsApp Inbox
  nav item and the WhatsApp/WhatsApp Templates/Instagram/Voice Agent/WhatsApp AI Agent cards show
  locked and open the upsell modal instead of navigating.
- [ ] Run `database:migrate --include-slow` on the VPS to apply the Horizon MANYCHAT_LIKE grant
  (user-run only).
EOF
)"
```

This opens the PR against `master` without merging or deploying — review/merge/deploy happen as
separate, explicit later steps.
