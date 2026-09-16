export type FacebookLoginAuthResponse = {
  code?: string;
  accessToken?: string;
  userID?: string;
};

export type FacebookLoginResponse = {
  authResponse: FacebookLoginAuthResponse | null;
  status?: 'connected' | 'not_authorized' | 'unknown';
};

export type FacebookSdk = {
  init: (options: {
    appId: string;
    cookie?: boolean;
    xfbml?: boolean;
    version: string;
  }) => void;
  login: (
    callback: (response: FacebookLoginResponse) => void,
    options: {
      config_id: string;
      response_type: 'code';
      override_default_response_type: true;
      extras?: Record<string, unknown>;
    },
  ) => void;
};

declare global {
  interface Window {
    FB?: FacebookSdk;
    fbAsyncInit?: () => void;
  }
}
