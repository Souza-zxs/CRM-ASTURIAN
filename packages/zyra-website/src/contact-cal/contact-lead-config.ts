// Public, non-secret coordinates of the CRM that receives contact requests
// from the site. The workspace id is already part of the public funnel URLs.
// `pageSlug` is the slug of the published funnel page created in the CRM
// (Settings > Workspace > Funnel) that collects these contacts.
export const CONTACT_LEAD_CONFIG = {
  apiUrl: 'https://zyra-api.179-199-135-212.sslip.io',
  pageSlug: 'contato',
  utmSource: 'site-fale-conosco',
  workspaceId: 'f7a7d81f-b6b3-42f3-8bba-51e74e90af90',
} as const;
