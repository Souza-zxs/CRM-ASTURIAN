export type FunnelTrackingConsentChoice = 'granted' | 'denied';

const STORAGE_KEY = 'funnel-tracking-consent';

// localStorage can throw (private windows, blocked site data), and can hold a
// value some other version wrote. Both read as "no decision yet", so the
// banner shows again instead of tracking without a clear yes.
export const readFunnelTrackingConsent =
  (): FunnelTrackingConsentChoice | null => {
    try {
      const storedValue = window.localStorage.getItem(STORAGE_KEY);

      return storedValue === 'granted' || storedValue === 'denied'
        ? storedValue
        : null;
    } catch {
      return null;
    }
  };

export const saveFunnelTrackingConsent = (
  consent: FunnelTrackingConsentChoice,
): void => {
  try {
    window.localStorage.setItem(STORAGE_KEY, consent);
  } catch {
    // The choice still applies for this page view through component state.
  }
};
