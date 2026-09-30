import { isForwardOpportunityStageMove } from 'src/modules/whatsapp-agent/utils/is-forward-opportunity-stage-move.util';

describe('isForwardOpportunityStageMove', () => {
  it('returns true when the next stage is further along the pipeline', () => {
    expect(isForwardOpportunityStageMove('NEW', 'SCREENING')).toBe(true);
    expect(isForwardOpportunityStageMove('NEW', 'PROPOSAL')).toBe(true);
    expect(isForwardOpportunityStageMove('SCREENING', 'MEETING')).toBe(true);
  });

  it('returns false when the next stage is the same as the current stage', () => {
    expect(isForwardOpportunityStageMove('SCREENING', 'SCREENING')).toBe(
      false,
    );
  });

  it('returns false when the next stage is behind the current stage', () => {
    expect(isForwardOpportunityStageMove('PROPOSAL', 'NEW')).toBe(false);
    expect(isForwardOpportunityStageMove('MEETING', 'SCREENING')).toBe(false);
  });

  it('returns false when the current stage is already CUSTOMER', () => {
    expect(isForwardOpportunityStageMove('CUSTOMER', 'PROPOSAL')).toBe(false);
  });

  it('returns false for a stage value outside the known pipeline', () => {
    expect(isForwardOpportunityStageMove('NEW', 'qualifying')).toBe(false);
    expect(isForwardOpportunityStageMove('CUSTOM_STAGE', 'NEW')).toBe(false);
  });
});
