import { ConfirmationModal } from '@/ui/layout/modal/components/ConfirmationModal';
import { t } from '@lingui/core/macro';
import { SettingsPath } from 'zyra-shared/types';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';

export type ModuleLimitBlockedModalProps = {
  modalInstanceId: string;
  // Human-readable module/feature name, e.g. "WhatsApp" or "Automação de
  // Processos" — kept as plain text (not the WorkspaceModule union) so this
  // component can also be used for the two reserved-but-unbuilt modules,
  // which have no real enum access check behind them yet.
  featureName: string;
  // When set, renders as "Você atingiu o limite do módulo (used/limit)"
  // instead of "Este recurso faz parte do módulo X" — pass this for a
  // numeric-limit block, omit it for a pure feature-not-contracted block.
  usage?: { used: number; limit: number };
  onClose?: () => void;
};

export const ModuleLimitBlockedModal = ({
  modalInstanceId,
  featureName,
  usage,
  onClose,
}: ModuleLimitBlockedModalProps) => {
  const navigateSettings = useNavigateSettings();

  const subtitle = usage
    ? t`Você atingiu o limite do módulo ${featureName} (${usage.used}/${usage.limit}). Adicione mais unidades do módulo para continuar.`
    : t`Este recurso faz parte do módulo ${featureName}, que ainda não foi contratado neste workspace.`;

  return (
    <ConfirmationModal
      modalInstanceId={modalInstanceId}
      title={t`Recurso bloqueado`}
      subtitle={subtitle}
      confirmButtonText={t`Ver módulos`}
      confirmButtonAccent="blue"
      onClose={onClose}
      onConfirmClick={() => navigateSettings(SettingsPath.PlanModules)}
    />
  );
};
