import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const instagramOauthRedirectUriState = createAtomState<string | null>({
  key: 'instagramOauthRedirectUriState',
  defaultValue: null,
});
