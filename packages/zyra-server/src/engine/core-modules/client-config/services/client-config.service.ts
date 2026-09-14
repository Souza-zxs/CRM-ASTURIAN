import { Injectable } from '@nestjs/common';

import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'zyra-shared/utils';

import { NodeEnvironment } from 'src/engine/core-modules/zyra-config/interfaces/node-environment.interface';
import { SupportDriver } from 'src/engine/core-modules/zyra-config/interfaces/support.interface';

import { MaintenanceModeService } from 'src/engine/core-modules/admin-panel/maintenance-mode.service';
import {
  type ClientAiModelConfig,
  type ClientConfig,
} from 'src/engine/core-modules/client-config/client-config.entity';
import { DomainServerConfigService } from 'src/engine/core-modules/domain/domain-server-config/services/domain-server-config.service';
import { EmailingDomainDriver } from 'src/engine/core-modules/emailing-domain/drivers/types/emailing-domain-driver.type';
import { PUBLIC_FEATURE_FLAGS } from 'src/engine/core-modules/feature-flag/constants/public-feature-flag.const';
import { ZyraConfigService } from 'src/engine/core-modules/zyra-config/zyra-config.service';
import {
  AUTO_SELECT_FAST_MODEL_ID,
  AUTO_SELECT_SMART_MODEL_ID,
} from 'zyra-shared/constants';
import { MODEL_FAMILY_LABELS } from 'src/engine/metadata-modules/ai/ai-models/constants/model-family-labels.const';
import { getNativeModelCapabilities } from 'src/engine/metadata-modules/ai/ai-models/utils/get-native-model-capabilities.util';
import { AiModelRegistryService } from 'src/engine/metadata-modules/ai/ai-models/services/ai-model-registry.service';

@Injectable()
export class ClientConfigService {
  constructor(
    private zyraConfigService: ZyraConfigService,
    private domainServerConfigService: DomainServerConfigService,
    private aiModelRegistryService: AiModelRegistryService,
    private maintenanceModeService: MaintenanceModeService,
  ) {}

  private isCloudflareIntegrationEnabled(): boolean {
    return (
      !!this.zyraConfigService.get('CLOUDFLARE_API_KEY') &&
      !!this.zyraConfigService.get('CLOUDFLARE_ZONE_ID')
    );
  }

  async getClientConfig(): Promise<ClientConfig> {
    const captchaProvider = this.zyraConfigService.get('CAPTCHA_DRIVER');
    const supportDriver = this.zyraConfigService.get('SUPPORT_DRIVER');
    const calendarBookingPageId = this.zyraConfigService.get(
      'CALENDAR_BOOKING_PAGE_ID',
    );

    const isEmailingDomainInDemoMode =
      this.zyraConfigService.get('EMAILING_DOMAIN_DRIVER') ===
      EmailingDomainDriver.LOG;

    const availableModels =
      this.aiModelRegistryService.getAdminFilteredModels();
    const recommendedModelIds =
      this.aiModelRegistryService.getRecommendedModelIds();
    const resolvedProviders =
      this.aiModelRegistryService.getResolvedProvidersForAdmin();

    const getProviderLabel = (providerName?: string | null) =>
      providerName
        ? (resolvedProviders[providerName]?.label ?? providerName)
        : undefined;

    const aiModels: ClientAiModelConfig[] = availableModels.map(
      (registeredModel) => {
        const modelConfig = this.aiModelRegistryService.getModelConfig(
          registeredModel.modelId,
        );

        const modelFamily = modelConfig?.modelFamily;
        const providerName = registeredModel.providerName;

        return {
          modelId: registeredModel.modelId,
          label: modelConfig?.label || registeredModel.modelId,
          modelFamily,
          modelFamilyLabel: modelFamily
            ? MODEL_FAMILY_LABELS[modelFamily]
            : undefined,
          sdkPackage: registeredModel.sdkPackage,
          providerName,
          providerLabel: getProviderLabel(providerName),
          nativeCapabilities: getNativeModelCapabilities(
            registeredModel.sdkPackage,
          ),
          inputCostPerMillionTokens: modelConfig?.inputCostPerMillionTokens,
          outputCostPerMillionTokens: modelConfig?.outputCostPerMillionTokens,
          contextWindowTokens: modelConfig?.contextWindowTokens,
          maxOutputTokens: modelConfig?.maxOutputTokens,
          isDeprecated: modelConfig?.isDeprecated,
          isRecommended: recommendedModelIds.has(registeredModel.modelId),
          dataResidency: modelConfig?.dataResidency,
        };
      },
    );

    if (aiModels.length > 0) {
      const defaultSpeedModel =
        this.aiModelRegistryService.getDefaultSpeedModel();
      const defaultSpeedModelConfig =
        this.aiModelRegistryService.getModelConfig(defaultSpeedModel?.modelId);

      const defaultPerformanceModel =
        this.aiModelRegistryService.getDefaultPerformanceModel();
      const defaultPerformanceModelConfig =
        this.aiModelRegistryService.getModelConfig(
          defaultPerformanceModel?.modelId,
        );

      aiModels.unshift(
        {
          modelId: AUTO_SELECT_SMART_MODEL_ID,
          label:
            defaultPerformanceModelConfig?.label ||
            defaultPerformanceModel?.modelId ||
            'Default',
          modelFamily: defaultPerformanceModelConfig?.modelFamily,
          providerName: defaultPerformanceModel?.providerName,
          providerLabel: getProviderLabel(
            defaultPerformanceModel?.providerName,
          ),
          sdkPackage: defaultPerformanceModel?.sdkPackage ?? null,
          nativeCapabilities: getNativeModelCapabilities(
            defaultPerformanceModel?.sdkPackage,
          ),
          inputCostPerMillionTokens:
            defaultPerformanceModelConfig?.inputCostPerMillionTokens,
          outputCostPerMillionTokens:
            defaultPerformanceModelConfig?.outputCostPerMillionTokens,
          contextWindowTokens:
            defaultPerformanceModelConfig?.contextWindowTokens,
          maxOutputTokens: defaultPerformanceModelConfig?.maxOutputTokens,
        },
        {
          modelId: AUTO_SELECT_FAST_MODEL_ID,
          label:
            defaultSpeedModelConfig?.label ||
            defaultSpeedModel?.modelId ||
            'Default',
          modelFamily: defaultSpeedModelConfig?.modelFamily,
          providerName: defaultSpeedModel?.providerName,
          providerLabel: getProviderLabel(defaultSpeedModel?.providerName),
          sdkPackage: defaultSpeedModel?.sdkPackage ?? null,
          nativeCapabilities: getNativeModelCapabilities(
            defaultSpeedModel?.sdkPackage,
          ),
          inputCostPerMillionTokens:
            defaultSpeedModelConfig?.inputCostPerMillionTokens,
          outputCostPerMillionTokens:
            defaultSpeedModelConfig?.outputCostPerMillionTokens,
          contextWindowTokens: defaultSpeedModelConfig?.contextWindowTokens,
          maxOutputTokens: defaultSpeedModelConfig?.maxOutputTokens,
        },
      );
    }

    const clientConfig: ClientConfig = {
      appVersion: this.zyraConfigService.get('APP_VERSION'),
      brand: {
        productName: this.zyraConfigService.get('ZYRA_PRODUCT_NAME'),
        tagline: this.zyraConfigService.get('ZYRA_PRODUCT_TAGLINE'),
        logoUrl: this.zyraConfigService.get('ZYRA_LOGO_URL'),
        supportEmail: this.zyraConfigService.get('ZYRA_SUPPORT_EMAIL'),
        legalFooterText: this.zyraConfigService.get('ZYRA_LEGAL_FOOTER_TEXT'),
      },
      billing: {
        isBillingEnabled: this.zyraConfigService.get('IS_BILLING_ENABLED'),
        billingUrl: this.zyraConfigService.get('BILLING_PLAN_REQUIRED_LINK'),
        stripePublishableKey: this.zyraConfigService.get(
          'BILLING_STRIPE_PUBLISHABLE_KEY',
        ),
        trialPeriods: [
          {
            duration: this.zyraConfigService.get(
              'BILLING_FREE_TRIAL_WITH_CREDIT_CARD_DURATION_IN_DAYS',
            ),
            isCreditCardRequired: true,
          },
          {
            duration: this.zyraConfigService.get(
              'BILLING_FREE_TRIAL_WITHOUT_CREDIT_CARD_DURATION_IN_DAYS',
            ),
            isCreditCardRequired: false,
          },
        ],
      },
      aiModels,
      authProviders: {
        google: this.zyraConfigService.get('AUTH_GOOGLE_ENABLED'),
        magicLink: false,
        password: this.zyraConfigService.get('AUTH_PASSWORD_ENABLED'),
        microsoft: this.zyraConfigService.get('AUTH_MICROSOFT_ENABLED'),
        sso: [],
      },
      signInPrefilled: this.zyraConfigService.get('SIGN_IN_PREFILLED'),
      isMultiWorkspaceEnabled: this.zyraConfigService.get(
        'IS_MULTIWORKSPACE_ENABLED',
      ),
      isEmailVerificationRequired: this.zyraConfigService.get(
        'IS_EMAIL_VERIFICATION_REQUIRED',
      ),
      defaultSubdomain: this.zyraConfigService.get('DEFAULT_SUBDOMAIN'),
      frontDomain: this.domainServerConfigService.getFrontUrl().hostname,
      support: {
        supportDriver: supportDriver ? supportDriver : SupportDriver.NONE,
        supportFrontChatId: this.zyraConfigService.get('SUPPORT_FRONT_CHAT_ID'),
      },
      sentry: {
        environment: this.zyraConfigService.get('SENTRY_ENVIRONMENT'),
        release: this.zyraConfigService.get('APP_VERSION'),
        dsn: this.zyraConfigService.get('SENTRY_FRONT_DSN'),
      },
      captcha: {
        provider: captchaProvider ? captchaProvider : undefined,
        siteKey: this.zyraConfigService.get('CAPTCHA_SITE_KEY'),
      },
      api: {
        mutationMaximumAffectedRecords: this.zyraConfigService.get(
          'MUTATION_MAXIMUM_AFFECTED_RECORDS',
        ),
      },
      isAttachmentPreviewEnabled: this.zyraConfigService.get(
        'IS_ATTACHMENT_PREVIEW_ENABLED',
      ),
      analyticsEnabled: this.zyraConfigService.get('ANALYTICS_ENABLED'),
      canManageFeatureFlags:
        this.zyraConfigService.get('NODE_ENV') ===
          NodeEnvironment.DEVELOPMENT ||
        this.zyraConfigService.get('IS_BILLING_ENABLED'),
      publicFeatureFlags: PUBLIC_FEATURE_FLAGS,
      isMicrosoftMessagingEnabled: this.zyraConfigService.get(
        'MESSAGING_PROVIDER_MICROSOFT_ENABLED',
      ),
      isMicrosoftCalendarEnabled: this.zyraConfigService.get(
        'CALENDAR_PROVIDER_MICROSOFT_ENABLED',
      ),
      isGoogleMessagingEnabled: this.zyraConfigService.get(
        'MESSAGING_PROVIDER_GMAIL_ENABLED',
      ),
      isGoogleCalendarEnabled: this.zyraConfigService.get(
        'CALENDAR_PROVIDER_GOOGLE_ENABLED',
      ),
      isWhatsappMessagingEnabled: this.zyraConfigService.get(
        'MESSAGING_PROVIDER_WHATSAPP_ENABLED',
      ),
      whatsappAppId: this.zyraConfigService.get('WHATSAPP_APP_ID'),
      whatsappEmbeddedSignupConfigurationId: this.zyraConfigService.get(
        'WHATSAPP_EMBEDDED_SIGNUP_CONFIGURATION_ID',
      ),
      isInstagramMessagingEnabled: this.zyraConfigService.get(
        'MESSAGING_PROVIDER_INSTAGRAM_ENABLED',
      ),
      instagramAppId: this.zyraConfigService.get('INSTAGRAM_APP_ID'),
      instagramOauthRedirectUri: this.zyraConfigService.get(
        'INSTAGRAM_OAUTH_REDIRECT_URI',
      ),
      isVoiceAgentEnabled: this.zyraConfigService.get('IS_VOICE_AGENT_ENABLED'),
      isWhatsappAiAgentEnabled: this.zyraConfigService.get(
        'IS_WHATSAPP_AI_AGENT_ENABLED',
      ),
      isConfigVariablesInDbEnabled: this.zyraConfigService.get(
        'IS_CONFIG_VARIABLES_IN_DB_ENABLED',
      ),
      isImapSmtpCaldavEnabled: this.zyraConfigService.get(
        'IS_IMAP_SMTP_CALDAV_ENABLED',
      ),
      isEmailingDomainInDemoMode,
      allowRequestsToZyraIcons: this.zyraConfigService.get(
        'ALLOW_REQUESTS_TO_ZYRA_ICONS',
      ),
      calendarBookingPageId: isNonEmptyString(calendarBookingPageId)
        ? calendarBookingPageId
        : undefined,
      isCloudflareIntegrationEnabled: this.isCloudflareIntegrationEnabled(),
      isClickHouseConfigured: !!this.zyraConfigService.get('CLICKHOUSE_URL'),
      isWorkspaceSchemaDDLLocked: this.zyraConfigService.get(
        'WORKSPACE_SCHEMA_DDL_LOCKED',
      ),
    };

    const maintenanceMode =
      await this.maintenanceModeService.getMaintenanceMode();

    if (isDefined(maintenanceMode)) {
      clientConfig.maintenance = {
        startAt: new Date(maintenanceMode.startAt),
        endAt: new Date(maintenanceMode.endAt),
        link: maintenanceMode.link,
      };
    }

    return clientConfig;
  }
}
