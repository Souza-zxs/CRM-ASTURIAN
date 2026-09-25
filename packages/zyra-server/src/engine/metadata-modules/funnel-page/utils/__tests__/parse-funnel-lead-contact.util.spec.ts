import { parseFunnelLeadName } from 'src/engine/metadata-modules/funnel-page/utils/parse-funnel-lead-name.util';
import { parseFunnelLeadPhone } from 'src/engine/metadata-modules/funnel-page/utils/parse-funnel-lead-phone.util';

describe('parseFunnelLeadName', () => {
  it('should split the first word from the remaining last name', () => {
    expect(parseFunnelLeadName('Maria da Silva')).toEqual({
      firstName: 'Maria',
      lastName: 'da Silva',
    });
  });

  it('should return an empty last name when only one word is given', () => {
    expect(parseFunnelLeadName('  Maria ')).toEqual({
      firstName: 'Maria',
      lastName: '',
    });
  });
});

describe('parseFunnelLeadPhone', () => {
  it('should treat a local number as Brazilian', () => {
    expect(parseFunnelLeadPhone('(83) 99999-9999')).toEqual({
      primaryPhoneNumber: '83999999999',
      primaryPhoneCallingCode: '+55',
      primaryPhoneCountryCode: 'BR',
    });
  });

  it('should strip a leading Brazilian country code', () => {
    expect(parseFunnelLeadPhone('+55 83 99999-9999')).toEqual({
      primaryPhoneNumber: '83999999999',
      primaryPhoneCallingCode: '+55',
      primaryPhoneCountryCode: 'BR',
    });
  });

  it('should keep only digits for an explicit foreign country code', () => {
    expect(parseFunnelLeadPhone('+351 912 345 678')).toEqual({
      primaryPhoneNumber: '351912345678',
    });
  });

  it('should return null when there are no digits', () => {
    expect(parseFunnelLeadPhone('abc')).toBeNull();
  });
});
