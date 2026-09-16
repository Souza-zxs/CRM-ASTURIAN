import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';
export const isInstagramMessagingEnabledState = createAtomState<boolean>({
  key: 'isInstagramMessagingEnabled',
  defaultValue: false,
});
