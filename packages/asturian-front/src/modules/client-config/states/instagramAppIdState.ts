import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const instagramAppIdState = createAtomState<string | null>({
  key: 'instagramAppIdState',
  defaultValue: null,
});
