import { OPPORTUNITY_STAGE_ORDER } from 'src/modules/whatsapp-agent/utils/opportunity-stage-order.constant';

// True only when nextStage is strictly further along the pipeline than
// currentStage — never regresses an Opportunity, and returns false (not an
// error) for any value outside the known pipeline, e.g. a workspace that
// customized its stage options away from the seeded defaults.
export const isForwardOpportunityStageMove = (
  currentStage: string,
  nextStage: string,
): boolean => {
  const currentIndex = OPPORTUNITY_STAGE_ORDER.indexOf(
    currentStage as (typeof OPPORTUNITY_STAGE_ORDER)[number],
  );
  const nextIndex = OPPORTUNITY_STAGE_ORDER.indexOf(
    nextStage as (typeof OPPORTUNITY_STAGE_ORDER)[number],
  );

  if (currentIndex === -1 || nextIndex === -1) {
    return false;
  }

  return nextIndex > currentIndex;
};
