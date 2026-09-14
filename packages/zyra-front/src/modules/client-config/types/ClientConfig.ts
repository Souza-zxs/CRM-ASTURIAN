import {
  type ApiConfig,
  type AuthProviders,
  type Billing,
  type Captcha,
  type ClientAiModelConfig,
  type ClientConfigMaintenanceMode,
  type PublicFeatureFlag,
  type Sentry,
  type Support,
} from '~/generated-metadata/graphql';

export type ClientConfigBrand = {
  productName: string;
  tagline: string;
  logoUrl: string;
  supportEmail: string;
  legalFooterText: string;
};

export type ClientConfig = {
  appVersion?: string;
  brand: ClientConfigBrand;
  aiModels: Array<ClientAiModelConfig>;
  analyticsEnabled: boolean;
  api: ApiConfig;
  authProviders: AuthProviders;
  billing: Billing;
  calendarBookingPageId?: string;
  canManageFeatureFlags: boolean;
  captcha: Captcha;
  defaultSubdomain?: string;
  frontDomain: string;
  isAttachmentPreviewEnabled: boolean;
  isConfigVariablesInDbEnabled: boolean;
  isEmailVerificationRequired: boolean;
  isGoogleCalendarEnabled: boolean;
  isGoogleMessagingEnabled: boolean;
  isMicrosoftCalendarEnabled: boolean;
  isMicrosoftMessagingEnabled: boolean;
  isWhatsappMessagingEnabled: boolean;
  whatsappAppId?: string;
  whatsappEmbeddedSignupConfigurationId?: string;
  isInstagramMessagingEnabled: boolean;
  instagramAppId?: string;
  instagramOauthRedirectUri?: string;
  isVoiceAgentEnabled: boolean;
  isWhatsappAiAgentEnabled: boolean;
  isMultiWorkspaceEnabled: boolean;
  isImapSmtpCaldavEnabled: boolean;
  isEmailingDomainInDemoMode: boolean;
  isCloudflareIntegrationEnabled: boolean;
  isClickHouseConfigured: boolean;
  isWorkspaceSchemaDDLLocked: boolean;
  publicFeatureFlags: Array<PublicFeatureFlag>;
  sentry: Sentry;
  signInPrefilled: boolean;
  support: Support;
  isTwoFactorAuthenticationEnabled: boolean;
  allowRequestsToZyraIcons: boolean;
  maintenance?: ClientConfigMaintenanceMode;
};
