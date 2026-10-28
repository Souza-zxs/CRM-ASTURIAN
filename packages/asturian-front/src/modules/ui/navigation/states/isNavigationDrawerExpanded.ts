import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

// Below this width the 84px icon rail plus the context panel would leave too
// little room for the page, so the panel starts collapsed (the rail stays).
export const NAVIGATION_DRAWER_COMPACT_VIEWPORT = 1100;

const isCompactViewport =
  window.innerWidth <= NAVIGATION_DRAWER_COMPACT_VIEWPORT;

export const isNavigationDrawerExpandedState = createAtomState<boolean>({
  key: 'isNavigationDrawerExpanded',
  defaultValue: !isCompactViewport,
  useLocalStorage: true,
});
