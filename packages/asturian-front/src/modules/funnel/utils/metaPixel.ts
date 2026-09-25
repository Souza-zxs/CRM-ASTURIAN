const FBEVENTS_URL = 'https://connect.facebook.net/en_US/fbevents.js';

// The queueing stub Meta's own snippet installs: calls made before fbevents.js
// finishes loading are queued, and the script replays them once it takes over.
type MetaPixelStub = {
  (...args: unknown[]): void;
  callMethod?: (...args: unknown[]) => void;
  queue: unknown[][];
  loaded: boolean;
  version: string;
  push: MetaPixelStub;
};

type MetaPixelWindow = {
  fbq?: MetaPixelStub;
  _fbq?: MetaPixelStub;
};

// The pixel script attaches itself to window under these two names, and
// window has no type for them.
// eslint-disable-next-line no-unsafe-type-assertion
const getPixelWindow = (): MetaPixelWindow =>
  window as unknown as MetaPixelWindow;

const createPixelStub = (): MetaPixelStub => {
  // eslint-disable-next-line no-unsafe-type-assertion
  const stub = ((...args: unknown[]) => {
    if (stub.callMethod !== undefined) {
      stub.callMethod(...args);

      return;
    }

    stub.queue.push(args);
  }) as unknown as MetaPixelStub;

  stub.queue = [];
  stub.loaded = true;
  stub.version = '2.0';
  stub.push = stub;

  return stub;
};

// Safe to call more than once: the second call finds fbq already installed.
// PageView is deliberately not fired here, so the caller decides when a page
// counts as viewed (first load, or a later route change inside the SPA).
export const initializeMetaPixel = (pixelId: string): void => {
  const pixelWindow = getPixelWindow();

  if (pixelWindow.fbq !== undefined) {
    return;
  }

  const stub = createPixelStub();

  pixelWindow.fbq = stub;
  pixelWindow._fbq = stub;

  const script = document.createElement('script');

  script.async = true;
  script.src = FBEVENTS_URL;
  document.head.appendChild(script);

  stub('init', pixelId);
};

// No-op until initializeMetaPixel ran, which only happens after consent, so
// callers can fire events without checking anything themselves. No personal
// data is sent: advanced matching is off. `eventId` is what a future server
// side Conversions API call reuses so Meta counts the event once, not twice.
export const trackMetaPixelEvent = ({
  eventName,
  parameters,
  eventId,
}: {
  eventName: string;
  parameters?: Record<string, string | number>;
  eventId?: string;
}): void => {
  const pixel = getPixelWindow().fbq;

  if (pixel === undefined) {
    return;
  }

  if (eventId === undefined) {
    pixel('track', eventName, parameters ?? {});

    return;
  }

  pixel('track', eventName, parameters ?? {}, { eventID: eventId });
};
