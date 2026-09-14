import { extractDomainFromLink } from 'src/modules/contact-creation-manager/utils/extract-domain-from-link.util';

describe('extractDomainFromLink', () => {
  it('should extract domain from link', () => {
    const link = 'https://www.zyra.com';
    const result = extractDomainFromLink(link);

    expect(result).toBe('zyra.com');
  });

  it('should extract domain from link without www', () => {
    const link = 'https://zyra.com';
    const result = extractDomainFromLink(link);

    expect(result).toBe('zyra.com');
  });

  it('should extract domain from link without protocol', () => {
    const link = 'zyra.com';
    const result = extractDomainFromLink(link);

    expect(result).toBe('zyra.com');
  });

  it('should extract domain from link with path', () => {
    const link = 'https://zyra.com/about';
    const result = extractDomainFromLink(link);

    expect(result).toBe('zyra.com');
  });
});
