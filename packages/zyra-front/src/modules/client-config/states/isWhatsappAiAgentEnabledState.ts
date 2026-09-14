import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';
export const isWhatsappAiAgentEnabledState = createAtomState<boolean>({
  key: 'isWhatsappAiAgentEnabled',
  defaultValue: false,
});
