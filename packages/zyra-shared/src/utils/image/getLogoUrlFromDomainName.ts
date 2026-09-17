export const sanitizeURL = (link: string | null | undefined) => {
  return link
    ? link.replace(/(https?:\/\/)|(www\.)/g, '').replace(/\/$/, '')
    : '';
};

export const getLogoUrlFromDomainName = (
  domainName?: string,
): string | undefined => {
  const sanitizedDomain = sanitizeURL(domainName);
  // zyra-icons.com was never registered — this fork's rebrand renamed the
  // upstream Twenty CRM domain (twenty-icons.com, a service Twenty hosts
  // itself) in text only, without standing up an equivalent service. Using
  // Clearbit's public logo API instead, since it does the same job (favicon
  // by domain) without needing infrastructure of our own.
  return sanitizedDomain
    ? `https://logo.clearbit.com/${sanitizedDomain}`
    : undefined;
};
