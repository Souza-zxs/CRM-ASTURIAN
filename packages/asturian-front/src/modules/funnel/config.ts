import { REACT_APP_SERVER_BASE_URL } from '~/config';

// Reuses the same backend the rest of the app talks to — the funnel's
// public REST endpoints live on zyra-server alongside the GraphQL API.
export const FUNNEL_API_URL: string = REACT_APP_SERVER_BASE_URL;

// Single-tenant: this app instance serves one workspace's funnel,
// configured at build time — not resolved from an authenticated session
// (funnel visitors are anonymous).
export const FUNNEL_WORKSPACE_ID: string =
  import.meta.env.REACT_APP_FUNNEL_WORKSPACE_ID ?? '';

// Meta Pixel ID, baked in at build time like the workspace id above. Empty
// means tracking is off: no banner, no script, nothing leaves the browser.
export const META_PIXEL_ID: string =
  import.meta.env.REACT_APP_META_PIXEL_ID ?? '';
