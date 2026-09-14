import { type ConfirmationModalCaller } from 'zyra-shared/types';

export type CommandMenuConfirmationModalResult = 'confirm' | 'cancel';

export type CommandMenuConfirmationModalResultBrowserEventDetail = {
  caller: ConfirmationModalCaller;
  confirmationResult: CommandMenuConfirmationModalResult;
};
