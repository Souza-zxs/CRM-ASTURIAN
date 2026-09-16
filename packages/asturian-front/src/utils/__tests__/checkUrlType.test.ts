import { checkUrlType } from '~/utils/checkUrlType';
import { LinkType } from 'zyra-ui/navigation';

describe('checkUrlType', () => {
  it('should detect LinkedIn urls', () => {
    expect(checkUrlType('https://www.linkedin.com/in/john')).toBe(
      LinkType.LinkedIn,
    );
    expect(checkUrlType('linkedin.com/company/zyra')).toBe(LinkType.LinkedIn);
  });

  it('should detect Twitter urls', () => {
    expect(checkUrlType('https://twitter.com/zyra')).toBe(LinkType.Twitter);
  });

  it('should detect X urls as Twitter', () => {
    expect(checkUrlType('https://x.com/zyra')).toBe(LinkType.Twitter);
  });

  it('should detect Facebook urls', () => {
    expect(checkUrlType('https://www.facebook.com/zyra')).toBe(
      LinkType.Facebook,
    );
  });

  it('should fall back to a generic url type', () => {
    expect(checkUrlType('https://example.com')).toBe(LinkType.Url);
    expect(checkUrlType('not-a-url')).toBe(LinkType.Url);
  });
});
