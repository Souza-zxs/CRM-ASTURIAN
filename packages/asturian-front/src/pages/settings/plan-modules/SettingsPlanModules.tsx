import { styled } from '@linaria/react';

import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsPageLayout } from '@/settings/components/layout/SettingsPageLayout';
import { SettingsCard } from '@/settings/components/SettingsCard';
import { useWorkspaceModules } from '@/workspace/hooks/useWorkspaceModules';
import { useWorkspacePlanUsage } from '@/workspace/hooks/useWorkspacePlanUsage';
import { type PlanLimitUsageKey } from '@/workspace/types/PlanLimitUsage';
import { type WorkspaceModule } from '@/workspace/types/WorkspaceModuleEntitlement';
import { useLingui } from '@lingui/react/macro';
import { Pill } from 'zyra-ui/data-display';
import { IconCheck, IconLock } from 'zyra-ui/icon';
import { Section } from 'zyra-ui/layout';
import { H2Title } from 'zyra-ui/typography';
import { ProgressBar } from 'zyra-ui/feedback';
import { MOBILE_VIEWPORT, themeCssVariables } from 'zyra-ui/theme-constants';

const StyledCardsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${themeCssVariables.spacing[4]};
  margin-top: ${themeCssVariables.spacing[6]};

  @media (max-width: ${MOBILE_VIEWPORT}px) {
    flex-direction: column;
  }
`;

const StyledCardSlot = styled.div`
  flex: 1 1 260px;
  min-width: 0;
`;

const StyledUsageList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[4]};
  margin-top: ${themeCssVariables.spacing[6]};
`;

const StyledUsageRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[1]};
`;

const StyledUsageRowHeader = styled.div`
  color: ${themeCssVariables.font.color.secondary};
  display: flex;
  font-size: ${themeCssVariables.font.size.sm};
  justify-content: space-between;
`;

// Human-readable labels for the dashboard — PlanLimitUsageKey stays a raw
// backend-matching key everywhere else, this is the one place it gets a
// user-facing name.
const USAGE_LABELS: Record<PlanLimitUsageKey, string> = {
  maxUsers: 'Usuários',
  maxContacts: 'Contatos',
  maxCompanies: 'Empresas',
  maxDashboards: 'Dashboards',
  maxWorkflowsActive: 'Automações ativas',
  maxWorkflowExecutionsMonthly: 'Execuções de automação (mês)',
  maxWhatsAppNumbers: 'Números de WhatsApp',
  maxAIAgents: 'Agentes de IA',
  maxAIMessagesMonthly: 'Mensagens de IA (mês)',
  maxVoiceAgents: 'Agentes de voz',
  maxVoiceMinutesMonthly: 'Minutos de voz (mês)',
  maxCustomObjects: 'Objetos customizados',
  maxCustomFields: 'Campos customizados',
};

const MODULE_LABELS: Record<WorkspaceModule, string> = {
  WHATSAPP: 'WhatsApp',
  INSTAGRAM: 'Instagram',
  AI_AGENT: 'Atendimento inteligente com IA',
  VOICE_AGENT: 'Agente de voz',
  WORKFLOWS_ADVANCED: 'Automação de processos',
  CUSTOM_OBJECTS: 'Objetos customizados',
  CUSTOM_FIELDS: 'Campos customizados',
  ROW_LEVEL_PERMISSIONS: 'Permissões por linha',
  API_ACCESS: 'Acesso à API',
  MCP: 'Conexão com IA (MCP)',
  MANYCHAT_LIKE: 'Automação de conversas (em breve)',
  INTEGRATIONS: 'Conexões com outras plataformas (em breve)',
};

export const SettingsPlanModules = () => {
  const { t } = useLingui();
  const { usage, loading: usageLoading } = useWorkspacePlanUsage();
  const { modules, loading: modulesLoading } = useWorkspaceModules();

  return (
    <SettingsPageLayout
      title={t`Planos e módulos`}
      links={[{ children: t`Workspace` }, { children: t`Planos e módulos` }]}
    >
      <SettingsPageContainer>
        <Section>
          <H2Title
            title={t`Uso`}
            description={t`O que o seu workspace já está usando, comparado ao incluso na base + módulos contratados.`}
          />
          {!usageLoading && (
            <StyledUsageList>
              {usage.map((entry) => (
                <StyledUsageRow key={entry.key}>
                  <StyledUsageRowHeader>
                    <span>{USAGE_LABELS[entry.key]}</span>
                    <span>
                      {entry.used}/{entry.limit}
                    </span>
                  </StyledUsageRowHeader>
                  <ProgressBar
                    value={
                      entry.limit > 0
                        ? Math.min(100, (entry.used / entry.limit) * 100)
                        : 100
                    }
                    ariaLabel={USAGE_LABELS[entry.key]}
                  />
                </StyledUsageRow>
              ))}
            </StyledUsageList>
          )}
        </Section>
        <Section>
          <H2Title
            title={t`Módulos`}
            description={t`Cada módulo é vendido separadamente, além da assinatura base.`}
          />
          {!modulesLoading && (
            <StyledCardsContainer>
              {modules.map((entitlement) => (
                <StyledCardSlot key={entitlement.module}>
                  <SettingsCard
                    Icon={
                      entitlement.hasAccess ? (
                        <IconCheck />
                      ) : (
                        <IconLock />
                      )
                    }
                    title={MODULE_LABELS[entitlement.module]}
                    description={
                      entitlement.hasAccess
                        ? t`Contratado${entitlement.quantity > 1 ? ` (${entitlement.quantity}x)` : ''}`
                        : t`Não contratado`
                    }
                    soon={!entitlement.implemented}
                    Status={
                      entitlement.hasAccess ? (
                        <Pill label={t`Ativo`} />
                      ) : (
                        <Pill label={t`Bloqueado`} />
                      )
                    }
                  />
                </StyledCardSlot>
              ))}
            </StyledCardsContainer>
          )}
        </Section>
      </SettingsPageContainer>
    </SettingsPageLayout>
  );
};
