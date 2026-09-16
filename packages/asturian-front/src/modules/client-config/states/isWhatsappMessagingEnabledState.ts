import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';
export const isWhatsappMessagingEnabledState = createAtomState<boolean>({
  key: 'isWhatsappMessagingEnabled',
  defaultValue: false,
});
