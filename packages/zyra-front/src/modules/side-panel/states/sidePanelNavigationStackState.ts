import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';
import { type SidePanelPages } from 'zyra-shared/types';
import { type IconComponent } from 'zyra-ui/icon';

export type SidePanelNavigationStackItem = {
  page: SidePanelPages;
  pageTitle: string;
  pageIcon: IconComponent;
  pageIconColor?: string;
  pageId: string;
};

export const sidePanelNavigationStackState = createAtomState<
  SidePanelNavigationStackItem[]
>({
  key: 'side-panel/sidePanelNavigationStackState',
  defaultValue: [],
});
