import { isDefined } from 'zyra-shared/utils';
import { StepStatus, type WorkflowRunStepInfos } from 'zyra-shared/workflow';

export const stepHasBeenStarted = (
  stepId: string,
  stepInfos: WorkflowRunStepInfos,
) => {
  return (
    isDefined(stepInfos[stepId]?.status) &&
    stepInfos[stepId].status !== StepStatus.NOT_STARTED
  );
};
