const DEFAULT_APP_URL = 'https://workshop-os-app.vercel.app';

const getAppUrl = (): string => {
  const configured = process.env.NEXT_PUBLIC_APP_URL;
  if (configured === undefined || configured === '') return DEFAULT_APP_URL;
  return configured.endsWith('/') ? configured.slice(0, -1) : configured;
};

const APP_URL = getAppUrl();

// Every external destination the site links to, in one place. Sections and
// data files never inline these.
export const SITE_URLS: Record<
  | 'appLogin'
  | 'appSignUp'
  | 'calBooking'
  | 'docsDevelopers'
  | 'docsGettingStarted'
  | 'docsUserGuide'
  | 'linkedin'
  | 'trustCenter'
  | 'x',
  string
> = {
  appLogin: `${APP_URL}/login`,
  appSignUp: `${APP_URL}/cadastro`,
  calBooking: 'https://cal.com/forms/f7841033-0a20-4958-8c92-4e34ec128a81',
  docsDevelopers: 'https://docs.zyra.com/developers/introduction',
  docsGettingStarted: 'https://docs.zyra.com/getting-started/introduction',
  docsUserGuide: 'https://docs.zyra.com/user-guide/introduction',
  linkedin: 'https://www.linkedin.com/company/zyra',
  trustCenter: 'https://trust.zyra.com',
  x: 'https://x.com/zyracrm',
};
