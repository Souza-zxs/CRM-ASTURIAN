import {
  type StepFilter,
  type StepFilterGroup,
  type StepFilterWithPotentiallyDeprecatedOperand,
} from 'zyra-shared/types';

export type FilterSettings = {
  stepFilterGroups?: StepFilterGroup[];
  stepFilters?: StepFilter[];
};

export type FilterSettingsWithPotentiallyDeprecatedOperand = {
  stepFilterGroups?: StepFilterGroup[];
  stepFilters?: StepFilterWithPotentiallyDeprecatedOperand[];
};
