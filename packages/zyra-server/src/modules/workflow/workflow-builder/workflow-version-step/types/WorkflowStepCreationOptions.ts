import { type WorkflowActionType } from 'zyra-shared/workflow';

type WorkflowIteratorStepConnectionOptions = {
  connectedStepType: WorkflowActionType.ITERATOR;
  settings: {
    isConnectedToLoop: boolean;
  };
};

export type WorkflowStepConnectionOptions =
  WorkflowIteratorStepConnectionOptions;
