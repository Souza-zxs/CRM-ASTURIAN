import { styled } from '@linaria/react';
import { useNavigate } from 'react-router-dom';
import { SettingsPath } from 'zyra-shared/types';
import { getSettingsPath } from 'zyra-shared/utils';
import { themeCssVariables } from 'zyra-ui/theme-constants';

import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { currentNavigationMenuItemFolderIdState } from '@/navigation-menu-item/common/states/currentNavigationMenuItemFolderIdState';
import { useIconRailItems } from '@/navigation/hooks/useIconRailItems';
import { type IconRailItem } from '@/navigation/types/IconRailItem';
import { isNavigationDrawerExpandedState } from '@/ui/navigation/states/isNavigationDrawerExpanded';
import { useIsMobile } from '@/ui/utilities/responsive/hooks/useIsMobile';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';

export const ICON_RAIL_WIDTH_PX = 84;
const ICON_RAIL_BUTTON_SIZE_PX = 44;

const StyledRail = styled.nav`
  align-items: center;
  background: ${themeCssVariables.background.primary};
  border-right: 1px solid ${themeCssVariables.border.color.light};
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  gap: ${themeCssVariables.spacing[4]};
  height: 100%;
  padding: ${themeCssVariables.spacing[4]} 0;
  width: ${ICON_RAIL_WIDTH_PX}px;
`;

const StyledBrandMark = styled.div`
  align-items: center;
  background: ${themeCssVariables.accent.accent9};
  border-radius: ${themeCssVariables.border.radius.md};
  color: ${themeCssVariables.background.primary};
  display: flex;
  flex-shrink: 0;
  font-size: ${themeCssVariables.font.size.lg};
  font-weight: ${themeCssVariables.font.weight.semiBold};
  height: ${ICON_RAIL_BUTTON_SIZE_PX}px;
  justify-content: center;
  width: ${ICON_RAIL_BUTTON_SIZE_PX}px;
`;

const StyledItems = styled.div`
  align-items: center;
  display: flex;
  flex: 1 1 auto;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
  min-height: 0;
  overflow-y: auto;
  padding: ${themeCssVariables.spacing[1]} 0;
  scrollbar-width: none;
  width: 100%;
`;

const StyledItemButton = styled.button<{ isActive: boolean }>`
  align-items: center;
  background: ${({ isActive }) =>
    isActive ? themeCssVariables.background.secondary : 'transparent'};
  border: none;
  border-radius: ${themeCssVariables.border.radius.md};
  color: ${({ isActive }) =>
    isActive
      ? themeCssVariables.accent.accent9
      : themeCssVariables.font.color.secondary};
  cursor: pointer;
  display: flex;
  flex-shrink: 0;
  height: ${ICON_RAIL_BUTTON_SIZE_PX}px;
  justify-content: center;
  position: relative;
  width: ${ICON_RAIL_BUTTON_SIZE_PX}px;

  &:hover {
    background: ${themeCssVariables.background.secondary};
    color: ${themeCssVariables.font.color.primary};
  }

  &:focus-visible {
    outline: 2px solid ${themeCssVariables.accent.accent9};
    outline-offset: 2px;
  }

  &::before {
    background: ${themeCssVariables.accent.accent9};
    border-radius: 0 2px 2px 0;
    content: '';
    display: ${({ isActive }) => (isActive ? 'block' : 'none')};
    height: 24px;
    left: -20px;
    position: absolute;
    width: 3px;
  }
`;

const StyledProfileButton = styled.button`
  align-items: center;
  background: ${themeCssVariables.background.tertiary};
  border: none;
  border-radius: ${themeCssVariables.border.radius.rounded};
  color: ${themeCssVariables.font.color.primary};
  cursor: pointer;
  display: flex;
  flex-shrink: 0;
  font-size: ${themeCssVariables.font.size.md};
  font-weight: ${themeCssVariables.font.weight.medium};
  height: ${ICON_RAIL_BUTTON_SIZE_PX}px;
  justify-content: center;
  width: ${ICON_RAIL_BUTTON_SIZE_PX}px;

  &:focus-visible {
    outline: 2px solid ${themeCssVariables.accent.accent9};
    outline-offset: 2px;
  }
`;

const getInitial = (text: string | undefined | null): string =>
  (text ?? '').trim().charAt(0).toUpperCase();

export const AppIconRail = () => {
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const items = useIconRailItems();
  const currentWorkspace = useAtomStateValue(currentWorkspaceState);
  const currentWorkspaceMember = useAtomStateValue(currentWorkspaceMemberState);
  const setOpenedFolderId = useSetAtomState(
    currentNavigationMenuItemFolderIdState,
  );
  const setIsNavigationDrawerExpanded = useSetAtomState(
    isNavigationDrawerExpandedState,
  );

  if (isMobile) {
    return null;
  }

  const handleItemClick = (item: IconRailItem) => {
    if (item.kind === 'folder') {
      setOpenedFolderId(item.id);
      setIsNavigationDrawerExpanded(true);

      return;
    }

    setOpenedFolderId(null);

    if (item.path !== undefined) {
      navigate(item.path);
    }
  };

  return (
    <StyledRail aria-label="Primary">
      <StyledBrandMark aria-hidden="true">
        {getInitial(currentWorkspace?.displayName)}
      </StyledBrandMark>
      <StyledItems>
        {items.map((item) => (
          <StyledItemButton
            key={item.id}
            type="button"
            aria-label={item.label}
            aria-current={item.isActive ? 'page' : undefined}
            title={item.label}
            isActive={item.isActive}
            onClick={() => handleItemClick(item)}
          >
            <item.Icon size={20} />
          </StyledItemButton>
        ))}
      </StyledItems>
      <StyledProfileButton
        type="button"
        aria-label="Profile"
        title="Profile"
        onClick={() => navigate(getSettingsPath(SettingsPath.ProfilePage))}
      >
        {getInitial(currentWorkspaceMember?.name?.firstName)}
      </StyledProfileButton>
    </StyledRail>
  );
};
