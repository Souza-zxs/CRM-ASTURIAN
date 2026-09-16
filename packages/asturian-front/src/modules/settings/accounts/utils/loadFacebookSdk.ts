import { type FacebookSdk } from '@/settings/accounts/types/FacebookSdk';
import { isDefined } from 'zyra-shared/utils';

const FACEBOOK_SDK_SCRIPT_ID = 'facebook-jssdk';
const FACEBOOK_SDK_SRC = 'https://connect.facebook.net/en_US/sdk.js';
const FACEBOOK_SDK_VERSION = 'v21.0';

let facebookSdkPromise: Promise<FacebookSdk> | null = null;

// WhatsApp Embedded Signup requires Meta's own JS SDK (FB.login with a
// config_id) — there is no server-side equivalent, so we load it lazily
// only when a user actually starts a WhatsApp connection.
export const loadFacebookSdk = (appId: string): Promise<FacebookSdk> => {
  if (isDefined(window.FB)) {
    return Promise.resolve(window.FB);
  }

  if (isDefined(facebookSdkPromise)) {
    return facebookSdkPromise;
  }

  facebookSdkPromise = new Promise<FacebookSdk>((resolve, reject) => {
    window.fbAsyncInit = () => {
      if (!isDefined(window.FB)) {
        reject(new Error('Facebook SDK failed to initialize.'));
        return;
      }

      window.FB.init({
        appId,
        cookie: true,
        xfbml: false,
        version: FACEBOOK_SDK_VERSION,
      });

      resolve(window.FB);
    };

    if (isDefined(document.getElementById(FACEBOOK_SDK_SCRIPT_ID))) {
      return;
    }

    const script = document.createElement('script');
    script.id = FACEBOOK_SDK_SCRIPT_ID;
    script.src = FACEBOOK_SDK_SRC;
    script.async = true;
    script.defer = true;
    script.onerror = () => {
      facebookSdkPromise = null;
      reject(new Error('Failed to load the Facebook SDK script.'));
    };

    document.body.appendChild(script);
  });

  return facebookSdkPromise;
};
