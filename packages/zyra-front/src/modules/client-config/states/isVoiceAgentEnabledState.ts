import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';
export const isVoiceAgentEnabledState = createAtomState<boolean>({
  key: 'isVoiceAgentEnabled',
  defaultValue: false,
});
