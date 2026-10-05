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
