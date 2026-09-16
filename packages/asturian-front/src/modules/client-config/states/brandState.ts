import { type ClientConfigBrand } from '@/client-config/types/ClientConfig';
import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const brandState = createAtomState<ClientConfigBrand | undefined>({
  key: 'brand',
  defaultValue: undefined,
});
