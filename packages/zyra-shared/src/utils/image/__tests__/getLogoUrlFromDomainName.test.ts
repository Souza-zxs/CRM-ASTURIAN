import {
  getLogoUrlFromDomainName,
  sanitizeURL,
} from '@/utils/image/getLogoUrlFromDomainName';

describe('sanitizeURL', () => {
  test('should sanitize the URL correctly', () => {
    expect(sanitizeURL('http://example.com/')).toBe('example.com');
    expect(sanitizeURL('https://www.example.com/')).toBe('example.com');
    expect(sanitizeURL('www.example.com')).toBe('example.com');
    expect(sanitizeURL('example.com')).toBe('example.com');
    expect(sanitizeURL('example.com/')).toBe('example.com');
  });

  test('should handle undefined input', () => {
    expect(sanitizeURL(undefined)).toBe('');
  });
});

describe('getLogoUrlFromDomainName', () => {
  test('should return the correct logo URL for a given domain', () => {
    expect(getLogoUrlFromDomainName('example.com')).toBe(
      'https://www.google.com/s2/favicons?domain=example.com&sz=128',
    );

    expect(getLogoUrlFromDomainName('http://example.com/')).toBe(
      'https://www.google.com/s2/favicons?domain=example.com&sz=128',
    );

    expect(getLogoUrlFromDomainName('https://www.example.com/')).toBe(
      'https://www.google.com/s2/favicons?domain=example.com&sz=128',
    );

    expect(getLogoUrlFromDomainName('www.example.com')).toBe(
      'https://www.google.com/s2/favicons?domain=example.com&sz=128',
    );

    expect(getLogoUrlFromDomainName('example.com/')).toBe(
      'https://www.google.com/s2/favicons?domain=example.com&sz=128',
    );

    expect(getLogoUrlFromDomainName('apple.com')).toBe(
      'https://www.google.com/s2/favicons?domain=apple.com&sz=128',
    );
  });

  test('should handle undefined input', () => {
    expect(getLogoUrlFromDomainName(undefined)).toBe(undefined);
  });
});
