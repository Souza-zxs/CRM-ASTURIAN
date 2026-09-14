// Emails render inside the zyra-server Node process (see message-campaign
// service and friends), so process.env already carries .env.brand's values
// by the time a template renders — see scripts/select-brand.mjs and
// environment.module.ts. Falls back to Zyra's own identity for the
// standalone `react-email` preview server, which has no zyra-server env.
export const brand = {
  productName: process.env.ZYRA_PRODUCT_NAME || 'Zyra',
  logoUrl:
    process.env.ZYRA_LOGO_URL ||
    'https://app.zyra.com/images/icons/windows11/Square150x150Logo.scale-100.png',
  legalFooterText: process.env.ZYRA_LEGAL_FOOTER_TEXT || 'Zyra — Horizon LTDA',
  websiteUrl: process.env.ZYRA_WEBSITE_URL || 'https://zyra.com/',
  docsUrl: process.env.ZYRA_DOCS_URL || 'https://docs.zyra.com',
};
