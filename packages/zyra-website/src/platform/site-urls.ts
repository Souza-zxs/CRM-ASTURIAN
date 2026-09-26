const DEFAULT_APP_URL = 'https://workshop-os-app.vercel.app';

const DEFAULT_DOCS_URL = 'https://workshop-os-docs.vercel.app';

const getAppUrl = (): string => {
  const configured = process.env.NEXT_PUBLIC_APP_URL;
  if (configured === undefined || configured === '') return DEFAULT_APP_URL;
  return configured.endsWith('/') ? configured.slice(0, -1) : configured;
};

const getDocsUrl = (): string => {
  const configured = process.env.NEXT_PUBLIC_DOCS_URL;
  if (configured === undefined || configured === '') return DEFAULT_DOCS_URL;
  return configured.endsWith('/') ? configured.slice(0, -1) : configured;
};

const APP_URL = getAppUrl();
const DOCS_URL = getDocsUrl();

// Every external destination the site links to, in one place. Sections and
// data files never inline these.
export const SITE_URLS: Record<
  | 'appLogin'
  | 'appSignUp'
  | 'docsDevelopers'
  | 'docsGettingStarted'
  | 'docsUserGuide',
  string
> = {
  appLogin: `${APP_URL}/login`,
  appSignUp: `${APP_URL}/cadastro`,
  docsDevelopers: `${DOCS_URL}/developers/introduction`,
  docsGettingStarted: `${DOCS_URL}/getting-started/introduction`,
  docsUserGuide: `${DOCS_URL}/user-guide/introduction`,
};
