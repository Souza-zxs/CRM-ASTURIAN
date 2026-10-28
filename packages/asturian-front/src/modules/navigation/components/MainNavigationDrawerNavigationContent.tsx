import { styled } from '@linaria/react';
import { lazy, Suspense } from 'react';

import { NavigationMenuItemFolderContentDispatcherEffect } from '@/navigation-menu-item/edit/components/NavigationMenuItemFolderContentDispatcher';
import { useNavigationMenuItemsByFolder } from '@/navigation-menu-item/display/folder/hooks/useNavigationMenuItemsByFolder';
import { NavigationDrawerOpenedSection } from '@/navigation-menu-item/display/sections/components/NavigationDrawerOpenedSection';
import { MainNavigationDrawerScrollableItems } from '@/navigation/components/MainNavigationDrawerScrollableItems';
import { useIconRailItems } from '@/navigation/hooks/useIconRailItems';
import { currentNavigationMenuItemFolderIdState } from '@/navigation-menu-item/common/states/currentNavigationMenuItemFolderIdState';
import { useIsMobile } from '@/ui/utilities/responsive/hooks/useIsMobile';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { themeCssVariables } from 'zyra-ui/theme-constants';

const FavoritesSectionDispatcher = lazy(() =>
  import('@/navigation-menu-item/display/sections/favorites/components/FavoritesSectionDispatcher').then(
    (module) => ({
      default: module.FavoritesSectionDispatcher,
    }),
  ),
);

const StyledScrollableContent = styled.div`
  height: 100%;
  min-height: 0;
`;

const StyledContextHeading = styled.div`
  color: ${themeCssVariables.font.color.primary};
  font-size: ${themeCssVariables.font.size.lg};
  font-weight: ${themeCssVariables.font.weight.semiBold};
  padding: ${themeCssVariables.spacing[2]} ${themeCssVariables.spacing[2]}
    ${themeCssVariables.spacing[3]};
`;

export const MainNavigationDrawerNavigationContent = () => {
  const isMobile = useIsMobile();
  const currentNavigationMenuItemFolderId = useAtomStateValue(
    currentNavigationMenuItemFolderIdState,
  );
  const { navigationMenuItemsByFolder } = useNavigationMenuItemsByFolder();
  const iconRailItems = useIconRailItems();

  // On desktop the icon rail already lists every top-level entry, so the
  // panel only shows the context of the entry that is active in the rail.
  const activeRailItem = isMobile
    ? undefined
    : iconRailItems.find((item) => item.isActive);

  const openedFolderId = isMobile
    ? currentNavigationMenuItemFolderId
    : activeRailItem?.kind === 'folder'
      ? activeRailItem.id
      : null;

  const openedNavigationMenuItemFolder = navigationMenuItemsByFolder.find(
    (folder) => folder.id === openedFolderId,
  );

  if (isMobile && !openedNavigationMenuItemFolder) {
    return (
      <StyledScrollableContent>
        <MainNavigationDrawerScrollableItems />
      </StyledScrollableContent>
    );
  }

  return (
    <StyledScrollableContent>
      {openedNavigationMenuItemFolder ? (
        <>
          {!isMobile && (
            <StyledContextHeading>
              {openedNavigationMenuItemFolder.folderName}
            </StyledContextHeading>
          )}
          <NavigationMenuItemFolderContentDispatcherEffect
            folderName={openedNavigationMenuItemFolder.folderName}
            folderId={openedNavigationMenuItemFolder.id ?? ''}
            navigationMenuItems={
              openedNavigationMenuItemFolder.navigationMenuItems
            }
            shouldShowBackButton={isMobile}
          />
        </>
      ) : (
        <>
          {activeRailItem !== undefined && (
            <StyledContextHeading>{activeRailItem.label}</StyledContextHeading>
          )}
          <NavigationDrawerOpenedSection />
          <Suspense fallback={null}>
            <FavoritesSectionDispatcher />
          </Suspense>
        </>
      )}
    </StyledScrollableContent>
  );
};
