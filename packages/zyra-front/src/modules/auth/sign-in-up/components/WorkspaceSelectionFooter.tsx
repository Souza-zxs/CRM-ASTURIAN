import { useAuth } from '@/auth/hooks/useAuth';
import { Trans } from '@lingui/react/macro';
import { ClickToActionLink } from 'zyra-ui/navigation';

export const WorkspaceSelectionFooter = () => {
  const { signOut } = useAuth();

  return (
    <ClickToActionLink onClick={signOut}>
      <Trans>Log out</Trans>
    </ClickToActionLink>
  );
};
