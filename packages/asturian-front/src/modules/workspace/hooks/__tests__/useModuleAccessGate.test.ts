import { renderHook } from '@testing-library/react';

import { useModuleAccessGate } from '@/workspace/hooks/useModuleAccessGate';

const mockUseWorkspaceModules = jest.fn();
const mockOpenModal = jest.fn();

jest.mock('@/workspace/hooks/useWorkspaceModules', () => ({
  useWorkspaceModules: () => mockUseWorkspaceModules(),
}));

jest.mock('@/ui/layout/modal/hooks/useModal', () => ({
  useModal: () => ({
    openModal: mockOpenModal,
    closeModal: jest.fn(),
    toggleModal: jest.fn(),
  }),
}));

describe('useModuleAccessGate', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return hasAccess true and isLocked false when the workspace has the module', () => {
    mockUseWorkspaceModules.mockReturnValue({
      modules: [],
      loading: false,
      hasModule: (module: string) => module === 'WHATSAPP',
    });

    const { result } = renderHook(() => useModuleAccessGate('WHATSAPP'));

    expect(result.current.hasAccess).toBe(true);
    expect(result.current.isLocked).toBe(false);
  });

  it('should return hasAccess false and isLocked true when the workspace does not have the module', () => {
    mockUseWorkspaceModules.mockReturnValue({
      modules: [],
      loading: false,
      hasModule: () => false,
    });

    const { result } = renderHook(() => useModuleAccessGate('WHATSAPP'));

    expect(result.current.hasAccess).toBe(false);
    expect(result.current.isLocked).toBe(true);
  });

  it('should treat a still-loading entitlement query as not locked', () => {
    mockUseWorkspaceModules.mockReturnValue({
      modules: [],
      loading: true,
      hasModule: () => false,
    });

    const { result } = renderHook(() => useModuleAccessGate('WHATSAPP'));

    expect(result.current.isLocked).toBe(false);
  });

  it('should open the upsell modal scoped to this module when openUpsellModal is called', () => {
    mockUseWorkspaceModules.mockReturnValue({
      modules: [],
      loading: false,
      hasModule: () => false,
    });

    const { result } = renderHook(() => useModuleAccessGate('WHATSAPP'));
    result.current.openUpsellModal();

    expect(mockOpenModal).toHaveBeenCalledWith('module-access-gate-WHATSAPP');
  });
});
