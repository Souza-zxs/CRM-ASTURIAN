export const FUNNEL_API_URL: string =
  import.meta.env.VITE_FUNNEL_API_URL ?? 'http://localhost:3000';

// Single-tenant: this site serves one workspace's funnel, configured at
// build time — not a multi-tenant router.
export const FUNNEL_WORKSPACE_ID: string =
  import.meta.env.VITE_FUNNEL_WORKSPACE_ID ?? '';
