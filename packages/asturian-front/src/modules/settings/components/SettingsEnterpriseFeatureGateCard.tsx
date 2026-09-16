import { currentUserState } from '@/auth/states/currentUserState';
import { SettingsOptionCardContentButton } from '@/settings/components/SettingsOptions/SettingsOptionCardContentButton';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { SettingsPath } from 'zyra-shared/types';
import { IconArrowUp, IconLock } from 'zyra-ui/icon';
import { Button } from 'zyra-ui/input';
import { Card } from 'zyra-ui/surfaces';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';

export const SettingsEnterpriseFeatureGateCard = ({
  title,
  description,
  buttonTitle,
}: {
  title: string;
  description: string;
  buttonTitle: string;
}) => {
  const currentUser = useAtomStateValue(currentUserState);
  const navigateSettings = useNavigateSettings();

  const canAccessAdminPanel = currentUser?.canAccessFullAdminPanel === true;

  return (
    <Card rounded>
      <SettingsOptionCardContentButton
        Icon={IconLock}
        title={title}
        description={description}
        Button={
          canAccessAdminPanel ? (
            <Button
              title={buttonTitle}
              variant="primary"
              accent="blue"
              size="small"
              Icon={IconArrowUp}
              onClick={() =>
                navigateSettings(SettingsPath.AdminPanelEnterprise)
              }
            />
          ) : undefined
        }
      />
    </Card>
  );
};
