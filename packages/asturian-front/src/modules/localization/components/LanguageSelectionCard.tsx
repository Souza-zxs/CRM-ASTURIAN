import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { LocalePicker } from '~/pages/settings/profile/appearance/components/LocalePicker';
import { ModalStatefulWrapper } from '@/ui/layout/modal/components/ModalStatefulWrapper';
import { useModal } from '@/ui/layout/modal/hooks/useModal';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { useEffect } from 'react';
import { isDefined } from 'zyra-shared/utils';
import { Button } from 'zyra-ui/input';
import { H1Title, H1TitleFontColor } from 'zyra-ui/typography';
import { themeCssVariables } from 'zyra-ui/theme-constants';

const MODAL_INSTANCE_ID = 'language-selection-card';

const StyledCenteredTitle = styled.div`
  text-align: center;
`;

const StyledSubtitle = styled.p`
  color: ${themeCssVariables.font.color.secondary};
  margin: ${themeCssVariables.spacing[2]} 0 ${themeCssVariables.spacing[6]};
  text-align: center;
`;

const StyledButtonContainer = styled.div`
  margin-top: ${themeCssVariables.spacing[6]};
`;

// localStorage, not a workspace member field: this is a one-time nicety
// ("did this browser already see the prompt?"), not state the product needs
// to read back anywhere else. Scoped per member so a shared machine with
// multiple logins (or impersonation) doesn't skip the card for someone new.
const getStorageKey = (workspaceMemberId: string) =>
  `language-selection-card-dismissed:${workspaceMemberId}`;

const hasDismissedCard = (workspaceMemberId: string): boolean => {
  try {
    return (
      window.localStorage.getItem(getStorageKey(workspaceMemberId)) !== null
    );
  } catch {
    return false;
  }
};

const markCardDismissed = (workspaceMemberId: string): void => {
  try {
    window.localStorage.setItem(getStorageKey(workspaceMemberId), 'true');
  } catch {
    // Worst case the card shows again next visit — not worth failing over.
  }
};

// Shown once per workspace member, the first time they land in the
// workspace, so they can confirm or change the language the product
// guessed. Mounted from DefaultLayout, alongside every authenticated page.
export const LanguageSelectionCard = () => {
  const { t } = useLingui();
  const currentWorkspaceMember = useAtomStateValue(currentWorkspaceMemberState);
  const { openModal, closeModal } = useModal();

  useEffect(() => {
    if (
      isDefined(currentWorkspaceMember) &&
      !hasDismissedCard(currentWorkspaceMember.id)
    ) {
      openModal(MODAL_INSTANCE_ID);
    }
    // Only ever evaluated once the member first becomes available.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentWorkspaceMember?.id]);

  if (!isDefined(currentWorkspaceMember)) {
    return null;
  }

  const handleDismiss = () => {
    markCardDismissed(currentWorkspaceMember.id);
    closeModal(MODAL_INSTANCE_ID);
  };

  return (
    <ModalStatefulWrapper
      modalInstanceId={MODAL_INSTANCE_ID}
      onClose={handleDismiss}
      isClosable
      padding="large"
      renderInDocumentBody
      smallBorderRadius
      narrowWidth
      autoHeight
    >
      <StyledCenteredTitle>
        <H1Title
          title={t`Choose your language`}
          fontColor={H1TitleFontColor.Primary}
        />
      </StyledCenteredTitle>
      <StyledSubtitle>{t`You can change this later in Settings.`}</StyledSubtitle>
      <LocalePicker />
      <StyledButtonContainer>
        <Button
          onClick={handleDismiss}
          variant="secondary"
          accent="blue"
          title={t`Continue`}
          fullWidth
          justify="center"
        />
      </StyledButtonContainer>
    </ModalStatefulWrapper>
  );
};
