import { styled } from '@linaria/react';
import { lazy, Suspense, useState } from 'react';

import { NavigationMenuItemFolderContentDispatcherEffect } from '@/navigation-menu-item/edit/components/NavigationMenuItemFolderContentDispatcher';
import { useNavigationMenuItemsByFolder } from '@/navigation-menu-item/display/folder/hooks/useNavigationMenuItemsByFolder';
import { NavigationDrawerOpenedSection } from '@/navigation-menu-item/display/sections/components/NavigationDrawerOpenedSection';
import { MainNavigationDrawerScrollableItems } from '@/navigation/components/MainNavigationDrawerScrollableItems';
import { useIconRailItems } from '@/navigation/hooks/useIconRailItems';
import { currentNavigationMenuItemFolderIdState } from '@/navigation-menu-item/common/states/currentNavigationMenuItemFolderIdState';
import { NavigationMenuItemDisplay } from '@/navigation-menu-item/display/components/NavigationMenuItemDisplay';
import { isNavigationMenuItemReadable } from '@/navigation-menu-item/common/utils/isNavigationMenuItemReadable';
import { objectMetadataItemsSelector } from '@/object-metadata/states/objectMetadataItemsSelector';
import { useObjectPermissions } from '@/object-record/hooks/useObjectPermissions';
import { viewsSelector } from '@/views/states/selectors/viewsSelector';
import { useIsMobile } from '@/ui/utilities/responsive/hooks/useIsMobile';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { IconTool } from 'zyra-ui/icon';
import { LightIconButton } from 'zyra-ui/input';
import { themeCssVariables } from 'zyra-ui/theme-constants';
import { useEnterLayoutCustomizationMode } from '@/layout-customization/hooks/useEnterLayoutCustomizationMode';
import { isLayoutCustomizationModeEnabledState } from '@/layout-customization/states/isLayoutCustomizationModeEnabledState';
import { preloadNavigationMenuItemDndKit } from '@/navigation-menu-item/display/dnd/preloadNavigationMenuItemDndKit';

const FavoritesSectionDispatcher = lazy(() =>
  import('@/navigation-menu-item/display/sections/favorites/components/FavoritesSectionDispatcher').then(
    (module) => ({
      default: module.FavoritesSectionDispatcher,
    }),
  ),
);

const WorkspaceSectionDispatcher = lazy(() =>
  import('@/navigation-menu-item/display/sections/workspace/components/WorkspaceSectionDispatcher').then(
    (module) => ({
      default: module.WorkspaceSectionDispatcher,
    }),
  ),
);

const StyledScrollableContent = styled.div`
  height: 100%;
  min-height: 0;
`;

const READ_ONLY_EDIT_MODE_PROPS = {
  isSelectedInEditMode: false,
  onEditModeClick: undefined,
} as const;

const StyledFolderItems = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.betweenSiblingsGap};
`;

const StyledContextHeadingRow = styled.div`
  align-items: center;
  display: flex;
  justify-content: space-between;
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
  const objectMetadataItems = useAtomStateValue(objectMetadataItemsSelector);
  const views = useAtomStateValue(viewsSelector);
  const { objectPermissionsByObjectMetadataId } = useObjectPermissions();
  const { enterLayoutCustomizationMode } = useEnterLayoutCustomizationMode();
  const isLayoutCustomizationModeEnabled = useAtomStateValue(
    isLayoutCustomizationModeEnabledState,
  );

  // On desktop the icon rail already lists every top-level entry, so the
  // panel only shows the context of the entry that is active in the rail.
  // Record pages live under a different base path than their list, so no
  // rail item is active there; keep showing the last active one.
  const [lastActiveRailItemId, setLastActiveRailItemId] = useState<
    string | undefined
  >(undefined);
  const currentActiveRailItem = isMobile
    ? undefined
    : iconRailItems.find((item) => item.isActive);

  if (
    currentActiveRailItem !== undefined &&
    currentActiveRailItem.id !== lastActiveRailItemId
  ) {
    setLastActiveRailItemId(currentActiveRailItem.id);
  }

  const activeRailItem = isMobile
    ? undefined
    : (currentActiveRailItem ??
      iconRailItems.find((item) => item.id === lastActiveRailItemId));

  const openedFolderId = isMobile
    ? currentNavigationMenuItemFolderId
    : activeRailItem?.kind === 'folder'
      ? activeRailItem.id
      : null;

  const openedNavigationMenuItemFolder = navigationMenuItemsByFolder.find(
    (folder) => folder.id === openedFolderId,
  );

  // Editing the menu needs the full tree (drag and drop, add item), so the
  // contextual panel steps aside while layout customization is on.
  if (!isMobile && isLayoutCustomizationModeEnabled) {
    return (
      <StyledScrollableContent>
        <Suspense fallback={null}>
          <WorkspaceSectionDispatcher />
        </Suspense>
      </StyledScrollableContent>
    );
  }

  const editWorkspaceButton = isMobile ? null : (
    <div onMouseEnter={preloadNavigationMenuItemDndKit}>
      <LightIconButton
        Icon={IconTool}
        accent="tertiary"
        size="small"
        aria-label="Edit workspace"
        onClick={() => enterLayoutCustomizationMode()}
      />
    </div>
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
            <StyledContextHeadingRow>
              <StyledContextHeading>
                {openedNavigationMenuItemFolder.folderName}
              </StyledContextHeading>
              {editWorkspaceButton}
            </StyledContextHeadingRow>
          )}
          {isMobile ? (
            <NavigationMenuItemFolderContentDispatcherEffect
              folderName={openedNavigationMenuItemFolder.folderName}
              folderId={openedNavigationMenuItemFolder.id ?? ''}
              navigationMenuItems={
                openedNavigationMenuItemFolder.navigationMenuItems
              }
              shouldShowBackButton
            />
          ) : (
            <StyledFolderItems>
              {openedNavigationMenuItemFolder.navigationMenuItems
                .filter((navigationMenuItem) =>
                  isNavigationMenuItemReadable({
                    item: navigationMenuItem,
                    objectMetadataItems,
                    views,
                    objectPermissionsByObjectMetadataId,
                  }),
                )
                .map((navigationMenuItem) => (
                  <NavigationMenuItemDisplay
                    key={navigationMenuItem.id}
                    item={navigationMenuItem}
                    editModeProps={READ_ONLY_EDIT_MODE_PROPS}
                    isDragging={false}
                    folderChildrenById={{}}
                    folderCount={0}
                    readOnly
                  />
                ))}
            </StyledFolderItems>
          )}
        </>
      ) : (
        <>
          <StyledContextHeadingRow>
            <StyledContextHeading>
              {activeRailItem?.label ?? ''}
            </StyledContextHeading>
            {editWorkspaceButton}
          </StyledContextHeadingRow>
          <NavigationDrawerOpenedSection />
          <Suspense fallback={null}>
            <FavoritesSectionDispatcher />
          </Suspense>
        </>
      )}
    </StyledScrollableContent>
  );
};
