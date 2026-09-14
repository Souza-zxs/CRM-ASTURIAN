import { aiModelsState } from '@/client-config/states/aiModelsState';
import { apiConfigState } from '@/client-config/states/apiConfigState';
import { appVersionState } from '@/client-config/states/appVersionState';
import { authProvidersState } from '@/client-config/states/authProvidersState';
import { billingState } from '@/client-config/states/billingState';
import { brandState } from '@/client-config/states/brandState';
import { calendarBookingPageIdState } from '@/client-config/states/calendarBookingPageIdState';
import { canManageFeatureFlagsState } from '@/client-config/states/canManageFeatureFlagsState';
import { captchaState } from '@/client-config/states/captchaState';
import { isAnalyticsEnabledState } from '@/client-config/states/isAnalyticsEnabledState';
import { isAttachmentPreviewEnabledState } from '@/client-config/states/isAttachmentPreviewEnabledState';
import { isConfigVariablesInDbEnabledState } from '@/client-config/states/isConfigVariablesInDbEnabledState';
import { isDeveloperDefaultSignInPrefilledState } from '@/client-config/states/isDeveloperDefaultSignInPrefilledState';
import { isClickHouseConfiguredState } from '@/client-config/states/isClickHouseConfiguredState';
import { isCloudflareIntegrationEnabledState } from '@/client-config/states/isCloudflareIntegrationEnabledState';
import { isDDLLockedState } from '@/client-config/states/isDDLLockedState';
import { isEmailingDomainInDemoModeState } from '@/client-config/states/isEmailingDomainInDemoModeState';
import { isEmailVerificationRequiredState } from '@/client-config/states/isEmailVerificationRequiredState';
import { isGoogleCalendarEnabledState } from '@/client-config/states/isGoogleCalendarEnabledState';
import { isGoogleMessagingEnabledState } from '@/client-config/states/isGoogleMessagingEnabledState';
import { isImapSmtpCaldavEnabledState } from '@/client-config/states/isImapSmtpCaldavEnabledState';
import { maintenanceModeState } from '@/client-config/states/maintenanceModeState';
import { isMicrosoftCalendarEnabledState } from '@/client-config/states/isMicrosoftCalendarEnabledState';
import { isMicrosoftMessagingEnabledState } from '@/client-config/states/isMicrosoftMessagingEnabledState';
import { isMultiWorkspaceEnabledState } from '@/client-config/states/isMultiWorkspaceEnabledState';
import { isWhatsappMessagingEnabledState } from '@/client-config/states/isWhatsappMessagingEnabledState';
import { whatsappAppIdState } from '@/client-config/states/whatsappAppIdState';
import { whatsappEmbeddedSignupConfigurationIdState } from '@/client-config/states/whatsappEmbeddedSignupConfigurationIdState';
import { isInstagramMessagingEnabledState } from '@/client-config/states/isInstagramMessagingEnabledState';
import { instagramAppIdState } from '@/client-config/states/instagramAppIdState';
import { instagramOauthRedirectUriState } from '@/client-config/states/instagramOauthRedirectUriState';
import { isVoiceAgentEnabledState } from '@/client-config/states/isVoiceAgentEnabledState';
import { isWhatsappAiAgentEnabledState } from '@/client-config/states/isWhatsappAiAgentEnabledState';
import { labPublicFeatureFlagsState } from '@/client-config/states/labPublicFeatureFlagsState';
import { sentryConfigState } from '@/client-config/states/sentryConfigState';
import { supportChatState } from '@/client-config/states/supportChatState';
import { type ClientConfig } from '@/client-config/types/ClientConfig';
import { domainConfigurationState } from '@/domain-manager/states/domainConfigurationState';
import { useCallback } from 'react';
import { clientConfigApiStatusState } from '@/client-config/states/clientConfigApiStatusState';
import { getClientConfig } from '@/client-config/utils/getClientConfig';
import { allowRequestsToZyraIconsState } from '@/client-config/states/allowRequestsToZyraIcons';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';

type UseClientConfigResult = {
  data: { clientConfig: ClientConfig } | undefined;
  loading: boolean;
  error: Error | undefined;
  fetchClientConfig: () => Promise<void>;
  refetch: () => Promise<void>;
};

export const useClientConfig = (): UseClientConfigResult => {
  const setIsAnalyticsEnabled = useSetAtomState(isAnalyticsEnabledState);
  const setDomainConfiguration = useSetAtomState(domainConfigurationState);
  const setAuthProviders = useSetAtomState(authProvidersState);
  const setAiModels = useSetAtomState(aiModelsState);

  const setIsDeveloperDefaultSignInPrefilled = useSetAtomState(
    isDeveloperDefaultSignInPrefilledState,
  );
  const setIsMultiWorkspaceEnabled = useSetAtomState(
    isMultiWorkspaceEnabledState,
  );
  const setIsEmailVerificationRequired = useSetAtomState(
    isEmailVerificationRequiredState,
  );

  const setBilling = useSetAtomState(billingState);
  const setBrand = useSetAtomState(brandState);
  const setSupportChat = useSetAtomState(supportChatState);

  const setSentryConfig = useSetAtomState(sentryConfigState);
  const [clientConfigApiStatus, setClientConfigApiStatus] = useAtomState(
    clientConfigApiStatusState,
  );

  const setCaptcha = useSetAtomState(captchaState);

  const setApiConfig = useSetAtomState(apiConfigState);

  const setCanManageFeatureFlags = useSetAtomState(canManageFeatureFlagsState);

  const setLabPublicFeatureFlags = useSetAtomState(labPublicFeatureFlagsState);

  const setIsMicrosoftMessagingEnabled = useSetAtomState(
    isMicrosoftMessagingEnabledState,
  );

  const setIsMicrosoftCalendarEnabled = useSetAtomState(
    isMicrosoftCalendarEnabledState,
  );

  const setIsGoogleMessagingEnabled = useSetAtomState(
    isGoogleMessagingEnabledState,
  );

  const setIsGoogleCalendarEnabled = useSetAtomState(
    isGoogleCalendarEnabledState,
  );

  const setIsWhatsappMessagingEnabled = useSetAtomState(
    isWhatsappMessagingEnabledState,
  );

  const setWhatsappAppId = useSetAtomState(whatsappAppIdState);

  const setWhatsappEmbeddedSignupConfigurationId = useSetAtomState(
    whatsappEmbeddedSignupConfigurationIdState,
  );

  const setIsInstagramMessagingEnabled = useSetAtomState(
    isInstagramMessagingEnabledState,
  );

  const setInstagramAppId = useSetAtomState(instagramAppIdState);

  const setInstagramOauthRedirectUri = useSetAtomState(
    instagramOauthRedirectUriState,
  );

  const setIsVoiceAgentEnabled = useSetAtomState(isVoiceAgentEnabledState);

  const setIsWhatsappAiAgentEnabled = useSetAtomState(
    isWhatsappAiAgentEnabledState,
  );

  const setIsAttachmentPreviewEnabled = useSetAtomState(
    isAttachmentPreviewEnabledState,
  );

  const setIsConfigVariablesInDbEnabled = useSetAtomState(
    isConfigVariablesInDbEnabledState,
  );

  const setCalendarBookingPageId = useSetAtomState(calendarBookingPageIdState);

  const setIsEmailingDomainInDemoMode = useSetAtomState(
    isEmailingDomainInDemoModeState,
  );

  const setIsImapSmtpCaldavEnabled = useSetAtomState(
    isImapSmtpCaldavEnabledState,
  );

  const setAllowRequestsToZyraIcons = useSetAtomState(
    allowRequestsToZyraIconsState,
  );

  const setIsCloudflareIntegrationEnabled = useSetAtomState(
    isCloudflareIntegrationEnabledState,
  );

  const setIsClickHouseConfigured = useSetAtomState(
    isClickHouseConfiguredState,
  );

  const setIsDDLLocked = useSetAtomState(isDDLLockedState);

  const setMaintenanceMode = useSetAtomState(maintenanceModeState);

  const setAppVersion = useSetAtomState(appVersionState);

  const fetchClientConfig = useCallback(async () => {
    setClientConfigApiStatus((prev) => ({
      ...prev,
      isLoading: true,
    }));

    try {
      const clientConfig = await getClientConfig();
      setClientConfigApiStatus((prev) => ({
        ...prev,
        isLoading: false,
        isLoadedOnce: true,
        isErrored: false,
        error: undefined,
        data: { clientConfig },
      }));
      setClientConfigApiStatus((currentStatus) => ({
        ...currentStatus,
        isErrored: false,
        error: undefined,
      }));
      setAppVersion(clientConfig.appVersion);
      setBrand(clientConfig.brand);
      setAuthProviders({
        google: clientConfig.authProviders.google,
        microsoft: clientConfig.authProviders.microsoft,
        password: clientConfig.authProviders.password,
        magicLink: false,
        sso: clientConfig.authProviders.sso,
      });
      setAiModels(clientConfig.aiModels ?? []);
      setIsAnalyticsEnabled(clientConfig.analyticsEnabled);
      setIsDeveloperDefaultSignInPrefilled(clientConfig.signInPrefilled);
      setIsMultiWorkspaceEnabled(clientConfig.isMultiWorkspaceEnabled);
      setIsEmailVerificationRequired(clientConfig.isEmailVerificationRequired);
      setBilling(clientConfig.billing);
      setSupportChat(clientConfig.support);

      setSentryConfig({
        dsn: clientConfig?.sentry?.dsn,
        release: clientConfig?.sentry?.release,
        environment: clientConfig?.sentry?.environment,
      });

      setCaptcha({
        provider: clientConfig?.captcha?.provider,
        siteKey: clientConfig?.captcha?.siteKey,
      });

      setApiConfig(clientConfig?.api);
      setDomainConfiguration({
        defaultSubdomain: clientConfig?.defaultSubdomain,
        frontDomain: clientConfig?.frontDomain,
      });
      setCanManageFeatureFlags(clientConfig?.canManageFeatureFlags);
      setLabPublicFeatureFlags(clientConfig?.publicFeatureFlags);
      setIsMicrosoftMessagingEnabled(clientConfig?.isMicrosoftMessagingEnabled);
      setIsMicrosoftCalendarEnabled(clientConfig?.isMicrosoftCalendarEnabled);
      setIsGoogleMessagingEnabled(clientConfig?.isGoogleMessagingEnabled);
      setIsGoogleCalendarEnabled(clientConfig?.isGoogleCalendarEnabled);
      setIsWhatsappMessagingEnabled(clientConfig?.isWhatsappMessagingEnabled);
      setWhatsappAppId(clientConfig?.whatsappAppId ?? null);
      setWhatsappEmbeddedSignupConfigurationId(
        clientConfig?.whatsappEmbeddedSignupConfigurationId ?? null,
      );
      setIsInstagramMessagingEnabled(
        clientConfig?.isInstagramMessagingEnabled,
      );
      setInstagramAppId(clientConfig?.instagramAppId ?? null);
      setInstagramOauthRedirectUri(
        clientConfig?.instagramOauthRedirectUri ?? null,
      );
      setIsVoiceAgentEnabled(clientConfig?.isVoiceAgentEnabled);
      setIsWhatsappAiAgentEnabled(clientConfig?.isWhatsappAiAgentEnabled);
      setIsAttachmentPreviewEnabled(clientConfig?.isAttachmentPreviewEnabled);
      setIsConfigVariablesInDbEnabled(
        clientConfig?.isConfigVariablesInDbEnabled,
      );
      setClientConfigApiStatus((currentStatus) => ({
        ...currentStatus,
        isSaved: true,
      }));

      setCalendarBookingPageId(clientConfig?.calendarBookingPageId ?? null);
      setIsImapSmtpCaldavEnabled(clientConfig?.isImapSmtpCaldavEnabled);
      setIsEmailingDomainInDemoMode(
        clientConfig?.isEmailingDomainInDemoMode ?? false,
      );
      setAllowRequestsToZyraIcons(clientConfig?.allowRequestsToZyraIcons);
      setIsCloudflareIntegrationEnabled(
        clientConfig?.isCloudflareIntegrationEnabled,
      );
      setIsClickHouseConfigured(clientConfig?.isClickHouseConfigured ?? false);
      setIsDDLLocked(clientConfig?.isWorkspaceSchemaDDLLocked ?? false);
      setMaintenanceMode(clientConfig?.maintenance ?? null);
    } catch (err) {
      const error =
        err instanceof Error ? err : new Error('Failed to fetch client config');
      setClientConfigApiStatus((prev) => ({
        ...prev,
        isLoading: false,
        isLoadedOnce: true,
        isErrored: true,
        error,
      }));
    }
  }, [
    setAiModels,
    setApiConfig,
    setAppVersion,
    setAuthProviders,
    setBilling,
    setBrand,
    setCalendarBookingPageId,
    setCanManageFeatureFlags,
    setCaptcha,
    setClientConfigApiStatus,
    setDomainConfiguration,
    setIsGoogleCalendarEnabled,
    setIsGoogleMessagingEnabled,
    setIsWhatsappMessagingEnabled,
    setWhatsappAppId,
    setWhatsappEmbeddedSignupConfigurationId,
    setIsInstagramMessagingEnabled,
    setInstagramAppId,
    setInstagramOauthRedirectUri,
    setIsVoiceAgentEnabled,
    setIsWhatsappAiAgentEnabled,
    setIsAnalyticsEnabled,
    setIsAttachmentPreviewEnabled,
    setIsConfigVariablesInDbEnabled,
    setIsDeveloperDefaultSignInPrefilled,
    setIsEmailVerificationRequired,
    setIsImapSmtpCaldavEnabled,
    setIsMultiWorkspaceEnabled,
    setIsEmailingDomainInDemoMode,
    setIsClickHouseConfigured,
    setIsCloudflareIntegrationEnabled,
    setIsDDLLocked,
    setLabPublicFeatureFlags,
    setMaintenanceMode,
    setIsMicrosoftCalendarEnabled,
    setIsMicrosoftMessagingEnabled,
    setSentryConfig,
    setSupportChat,
    setAllowRequestsToZyraIcons,
  ]);

  return {
    data: clientConfigApiStatus.data,
    loading: clientConfigApiStatus.isLoading || false,
    error: clientConfigApiStatus.error,
    fetchClientConfig,
    refetch: fetchClientConfig,
  };
};
