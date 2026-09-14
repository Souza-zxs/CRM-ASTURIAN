import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const whatsappEmbeddedSignupConfigurationIdState = createAtomState<
  string | null
>({
  key: 'whatsappEmbeddedSignupConfigurationIdState',
  defaultValue: null,
});
