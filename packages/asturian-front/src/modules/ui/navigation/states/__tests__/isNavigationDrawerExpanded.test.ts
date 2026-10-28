const readDefaultExpandedState = (viewportWidth: number): boolean => {
  window.localStorage.clear();
  Object.defineProperty(window, 'innerWidth', {
    configurable: true,
    value: viewportWidth,
  });

  let isExpanded = false;

  jest.isolateModules(() => {
    // The default is computed when the module loads, so load it fresh.
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { isNavigationDrawerExpandedState } = require('@/ui/navigation/states/isNavigationDrawerExpanded');
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { jotaiStore } = require('@/ui/utilities/state/jotai/jotaiStore');

    isExpanded = jotaiStore.get(isNavigationDrawerExpandedState.atom);
  });

  return isExpanded;
};

describe('isNavigationDrawerExpandedState default', () => {
  it('should start collapsed on mobile widths', () => {
    expect(readDefaultExpandedState(480)).toBe(false);
  });

  it('should start collapsed between the mobile breakpoint and 1100px, where the icon rail keeps the navigation reachable', () => {
    expect(readDefaultExpandedState(900)).toBe(false);
  });

  it('should start expanded on wide desktop screens', () => {
    expect(readDefaultExpandedState(1440)).toBe(true);
  });
});
