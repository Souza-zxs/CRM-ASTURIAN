import { type CommandMenuItemManifest } from 'zyra-shared/application';

export type CommandMenuItemConfig = Omit<
  CommandMenuItemManifest,
  'conditionalAvailabilityExpression'
> & {
  conditionalAvailabilityExpression?: boolean | string;
};
