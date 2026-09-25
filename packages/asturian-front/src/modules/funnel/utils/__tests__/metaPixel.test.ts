import {
  initializeMetaPixel,
  trackMetaPixelEvent,
} from '@/funnel/utils/metaPixel';

type PixelCall = unknown[];

const getPixel = () =>
  (
    window as unknown as {
      fbq?: { queue: PixelCall[] };
    }
  ).fbq;

const removePixel = () => {
  delete (window as unknown as { fbq?: unknown }).fbq;
  delete (window as unknown as { _fbq?: unknown })._fbq;
  document
    .querySelectorAll('script[src*="fbevents"]')
    .forEach((script) => script.remove());
};

describe('metaPixel', () => {
  beforeEach(removePixel);
  afterEach(removePixel);

  describe('before initialization (no consent)', () => {
    it('should do nothing and not throw when tracking an event', () => {
      expect(() =>
        trackMetaPixelEvent({ eventName: 'Lead', eventId: 'lead-1' }),
      ).not.toThrow();
      expect(getPixel()).toBeUndefined();
      expect(document.querySelectorAll('script[src*="fbevents"]')).toHaveLength(
        0,
      );
    });
  });

  describe('initializeMetaPixel', () => {
    it('should load the Meta script once and queue the init call', () => {
      initializeMetaPixel('123456');

      const scripts = document.querySelectorAll('script[src*="fbevents"]');

      expect(scripts).toHaveLength(1);
      expect(scripts[0].getAttribute('src')).toBe(
        'https://connect.facebook.net/en_US/fbevents.js',
      );
      expect(getPixel()?.queue).toEqual([['init', '123456']]);
    });

    it('should not add a second script or a second init when called twice', () => {
      initializeMetaPixel('123456');
      initializeMetaPixel('123456');

      expect(document.querySelectorAll('script[src*="fbevents"]')).toHaveLength(
        1,
      );
      expect(getPixel()?.queue).toEqual([['init', '123456']]);
    });

    it('should not fire a PageView by itself', () => {
      initializeMetaPixel('123456');

      expect(getPixel()?.queue.some((call) => call[1] === 'PageView')).toBe(
        false,
      );
    });
  });

  describe('trackMetaPixelEvent after initialization', () => {
    it('should queue a plain event', () => {
      initializeMetaPixel('123456');
      trackMetaPixelEvent({ eventName: 'PageView' });

      expect(getPixel()?.queue).toContainEqual(['track', 'PageView', {}]);
    });

    it('should send the event id used for later deduplication', () => {
      initializeMetaPixel('123456');
      trackMetaPixelEvent({ eventName: 'Lead', eventId: 'lead-1' });

      expect(getPixel()?.queue).toContainEqual([
        'track',
        'Lead',
        {},
        { eventID: 'lead-1' },
      ]);
    });

    it('should pass custom parameters through', () => {
      initializeMetaPixel('123456');
      trackMetaPixelEvent({
        eventName: 'InitiateCheckout',
        parameters: { value: 97, currency: 'BRL' },
      });

      expect(getPixel()?.queue).toContainEqual([
        'track',
        'InitiateCheckout',
        { value: 97, currency: 'BRL' },
      ]);
    });
  });
});
