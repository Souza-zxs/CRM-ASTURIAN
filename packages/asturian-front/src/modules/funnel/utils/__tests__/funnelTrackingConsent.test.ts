import {
  readFunnelTrackingConsent,
  saveFunnelTrackingConsent,
} from '@/funnel/utils/funnelTrackingConsent';

describe('funnelTrackingConsent', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should have no decision before the visitor answers', () => {
    expect(readFunnelTrackingConsent()).toBeNull();
  });

  it('should remember an accepted choice', () => {
    saveFunnelTrackingConsent('granted');

    expect(readFunnelTrackingConsent()).toBe('granted');
  });

  it('should remember a declined choice', () => {
    saveFunnelTrackingConsent('denied');

    expect(readFunnelTrackingConsent()).toBe('denied');
  });

  it('should treat an unknown stored value as no decision', () => {
    window.localStorage.setItem('funnel-tracking-consent', 'maybe');

    expect(readFunnelTrackingConsent()).toBeNull();
  });

  it('should treat a blocked localStorage as no decision instead of throwing', () => {
    jest.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('blocked');
    });

    expect(readFunnelTrackingConsent()).toBeNull();
  });

  it('should not throw when saving into a blocked localStorage', () => {
    jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('blocked');
    });

    expect(() => saveFunnelTrackingConsent('granted')).not.toThrow();
  });
});
