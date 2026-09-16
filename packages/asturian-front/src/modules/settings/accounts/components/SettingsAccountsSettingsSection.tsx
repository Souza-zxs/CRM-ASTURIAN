import { styled } from '@linaria/react';
import { useContext } from 'react';

import { isInstagramMessagingEnabledState } from '@/client-config/states/isInstagramMessagingEnabledState';
import { isVoiceAgentEnabledState } from '@/client-config/states/isVoiceAgentEnabledState';
import { isWhatsappAiAgentEnabledState } from '@/client-config/states/isWhatsappAiAgentEnabledState';
import { isWhatsappMessagingEnabledState } from '@/client-config/states/isWhatsappMessagingEnabledState';
import { SettingsCard } from '@/settings/components/SettingsCard';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useLingui } from '@lingui/react/macro';
import { SettingsPath } from 'zyra-shared/types';
import { getSettingsPath } from 'zyra-shared/utils';
import {
  IconBrandInstagram,
  IconBrandWhatsapp,
  IconCalendarEvent,
  IconFileText,
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
          </StyledCardLinkSlot>
        )}
        {isWhatsappMessagingEnabled && (
          <StyledCardLinkSlot>
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
          </StyledCardLinkSlot>
        )}
        {isInstagramMessagingEnabled && (
          <StyledCardLinkSlot>
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
          </StyledCardLinkSlot>
        )}
        {isVoiceAgentEnabled && (
          <StyledCardLinkSlot>
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
          </StyledCardLinkSlot>
        )}
        {isWhatsappAiAgentEnabled && (
          <StyledCardLinkSlot>
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
          </StyledCardLinkSlot>
        )}
      </StyledCardsContainer>
    </Section>
  );
};
