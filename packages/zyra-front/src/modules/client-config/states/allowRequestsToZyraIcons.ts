import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const allowRequestsToZyraIconsState = createAtomState<boolean>({
  key: 'allowRequestsToZyraIcons',
  defaultValue: true,
});
