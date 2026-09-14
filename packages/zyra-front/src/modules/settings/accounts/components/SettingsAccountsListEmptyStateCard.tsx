import { isGoogleCalendarEnabledState } from '@/client-config/states/isGoogleCalendarEnabledState';
import { isGoogleMessagingEnabledState } from '@/client-config/states/isGoogleMessagingEnabledState';
import { isImapSmtpCaldavEnabledState } from '@/client-config/states/isImapSmtpCaldavEnabledState';
import { isInstagramMessagingEnabledState } from '@/client-config/states/isInstagramMessagingEnabledState';
import { isMicrosoftCalendarEnabledState } from '@/client-config/states/isMicrosoftCalendarEnabledState';
import { isMicrosoftMessagingEnabledState } from '@/client-config/states/isMicrosoftMessagingEnabledState';
import { isWhatsappMessagingEnabledState } from '@/client-config/states/isWhatsappMessagingEnabledState';
import { useConnectInstagramAccount } from '@/settings/accounts/hooks/useConnectInstagramAccount';
import { useConnectWhatsappNumber } from '@/settings/accounts/hooks/useConnectWhatsappNumber';
import { useTriggerApisOAuth } from '@/settings/accounts/hooks/useTriggerApiOAuth';
import { SettingsCard } from '@/settings/components/SettingsCard';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { useContext } from 'react';
import { ConnectedAccountProvider, SettingsPath } from 'zyra-shared/types';
import { getSettingsPath } from 'zyra-shared/utils';
import {
  IconAt,
  IconBrandInstagram,
  IconBrandWhatsapp,
  IconGoogle,
  IconMicrosoft,
} from 'zyra-ui/icon';
import { UndecoratedLink } from 'zyra-ui/navigation';
import { ThemeContext, themeCssVariables } from 'zyra-ui/theme-constants';

const StyledCardsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
`;

export const SettingsAccountsListEmptyStateCard = () => {
  const { theme } = useContext(ThemeContext);
  const { triggerApisOAuth } = useTriggerApisOAuth();

  const { t } = useLingui();

  const isGoogleMessagingEnabled = useAtomStateValue(
    isGoogleMessagingEnabledState,
  );
  const isMicrosoftMessagingEnabled = useAtomStateValue(
    isMicrosoftMessagingEnabledState,
  );

  const isGoogleCalendarEnabled = useAtomStateValue(
    isGoogleCalendarEnabledState,
  );

  const isMicrosoftCalendarEnabled = useAtomStateValue(
    isMicrosoftCalendarEnabledState,
  );

  const isImapSmtpCaldavEnabled = useAtomStateValue(
    isImapSmtpCaldavEnabledState,
  );

  const isWhatsappMessagingEnabled = useAtomStateValue(
    isWhatsappMessagingEnabledState,
  );

  const isInstagramMessagingEnabled = useAtomStateValue(
    isInstagramMessagingEnabledState,
  );

  const { connectWhatsappNumber } = useConnectWhatsappNumber();
  const { connectInstagramAccount } = useConnectInstagramAccount();

  return (
    <StyledCardsContainer>
      {(isGoogleMessagingEnabled || isGoogleCalendarEnabled) && (
        <SettingsCard
          Icon={<IconGoogle size={theme.icon.size.md} />}
          title={t`Connect with Google`}
          onClick={() => triggerApisOAuth(ConnectedAccountProvider.GOOGLE)}
        />
      )}

      {(isMicrosoftMessagingEnabled || isMicrosoftCalendarEnabled) && (
        <SettingsCard
          Icon={<IconMicrosoft size={theme.icon.size.md} />}
          title={t`Connect with Microsoft`}
          onClick={() => triggerApisOAuth(ConnectedAccountProvider.MICROSOFT)}
        />
      )}

      {isImapSmtpCaldavEnabled && (
        <UndecoratedLink
          to={getSettingsPath(SettingsPath.NewImapSmtpCaldavConnection)}
        >
          <SettingsCard
            Icon={<IconAt size={theme.icon.size.md} />}
            title={t`Connect via IMAP/SMTP`}
          />
        </UndecoratedLink>
      )}

      {isWhatsappMessagingEnabled && (
        <SettingsCard
          Icon={<IconBrandWhatsapp size={theme.icon.size.md} />}
          title={t`Connect with WhatsApp`}
          onClick={() => connectWhatsappNumber()}
        />
      )}

      {isInstagramMessagingEnabled && (
        <SettingsCard
          Icon={<IconBrandInstagram size={theme.icon.size.md} />}
          title={t`Connect with Instagram`}
          onClick={() => connectInstagramAccount()}
        />
      )}
    </StyledCardsContainer>
  );
};
