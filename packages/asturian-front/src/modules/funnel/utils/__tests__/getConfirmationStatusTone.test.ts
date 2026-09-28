import { getConfirmationStatusTone } from '@/funnel/utils/getConfirmationStatusTone';

describe('getConfirmationStatusTone', () => {
  it('should return declined for a declined payment', () => {
    expect(getConfirmationStatusTone('pagamento_recusado')).toBe('declined');
  });

  it('should return success for a signup confirmation', () => {
    expect(getConfirmationStatusTone('inscricao')).toBe('success');
  });

  it('should return success for a purchase confirmation', () => {
    expect(getConfirmationStatusTone('compra')).toBe('success');
  });
});
