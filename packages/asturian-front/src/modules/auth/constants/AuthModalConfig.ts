import { type ModalOverlay, type ModalSize } from 'zyra-ui/surfaces';
import { AppPath } from 'zyra-shared/types';

type AuthModalConfigType = {
  size: ModalSize;
  overlay: ModalOverlay;
  showScrollWrapper: boolean;
};

export const AUTH_MODAL_CONFIG: {
  default: AuthModalConfigType;
  [key: string]: AuthModalConfigType;
} = {
  default: {
    size: 'medium',
    overlay: 'dark',
    showScrollWrapper: true,
  },
  [AppPath.BookCall]: {
    size: 'extraLarge',
    overlay: 'transparent',
    showScrollWrapper: false,
  },
  // /login and /cadastro render the split-screen AuthSplitLayout, which is
  // full-bleed by design — no modal chrome (backdrop, centered card) should
  // show through it.
  [AppPath.Login]: {
    size: 'fullscreen',
    overlay: 'transparent',
    showScrollWrapper: false,
  },
  [AppPath.SignUp]: {
    size: 'fullscreen',
    overlay: 'transparent',
    showScrollWrapper: false,
  },
};
