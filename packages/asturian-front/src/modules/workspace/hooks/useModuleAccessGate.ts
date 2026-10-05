import { useModal } from '@/ui/layout/modal/hooks/useModal';
import { useWorkspaceModules } from '@/workspace/hooks/useWorkspaceModules';
import { type WorkspaceModule } from '@/workspace/types/WorkspaceModuleEntitlement';

export const getModuleAccessGateModalId = (module: WorkspaceModule): string =>
  `module-access-gate-${module}`;

export const useModuleAccessGate = (module: WorkspaceModule) => {
  const { hasModule, loading } = useWorkspaceModules();
  const { openModal } = useModal();

  const hasAccess = loading || hasModule(module);
  const isLocked = !hasAccess;
  const modalInstanceId = getModuleAccessGateModalId(module);

  const openUpsellModal = () => {
    openModal(modalInstanceId);
  };

  return { hasAccess, isLocked, modalInstanceId, openUpsellModal };
};
