import { normalizeWhatsappRecipient } from 'src/modules/workflow/workflow-executor/workflow-actions/send-whatsapp-template/utils/normalize-whatsapp-recipient.util';

describe('normalizeWhatsappRecipient', () => {
  it('should prepend 55 to a national Brazilian mobile number', () => {
    expect(normalizeWhatsappRecipient('83999999999')).toBe('5583999999999');
  });

  it('should prepend 55 to a national Brazilian landline number', () => {
    expect(normalizeWhatsappRecipient('(83) 3333-4444')).toBe('558333334444');
  });

  it('should keep a number that already carries the country code', () => {
    expect(normalizeWhatsappRecipient('+55 83 99999-9999')).toBe(
      '5583999999999',
    );
  });

  it('should keep a foreign number untouched apart from formatting', () => {
    expect(normalizeWhatsappRecipient('+351 912 345 678')).toBe('351912345678');
  });

  it('should return an empty string when there are no digits', () => {
    expect(normalizeWhatsappRecipient('abc')).toBe('');
  });
});
