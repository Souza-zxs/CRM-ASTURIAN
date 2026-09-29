import { normalizePhoneHandleForMatching } from 'src/modules/match-participant/utils/normalize-phone-handle-for-matching';

describe('normalizePhoneHandleForMatching', () => {
  it('strips the leading Brazilian country-code prefix', () => {
    expect(normalizePhoneHandleForMatching('5511999999999')).toBe(
      '11999999999',
    );
  });

  it('returns a handle with no leading 55 prefix unchanged', () => {
    expect(normalizePhoneHandleForMatching('11999999999')).toBe(
      '11999999999',
    );
  });

  it('falls back to the original value for an unparseable handle', () => {
    expect(normalizePhoneHandleForMatching('')).toBe('');
  });
});
