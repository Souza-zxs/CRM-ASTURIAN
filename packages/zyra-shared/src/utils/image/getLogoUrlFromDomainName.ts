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
  // itself) in text only, without standing up an equivalent service.
  // Clearbit's public logo API (logo.clearbit.com) was used next, but
  // Clearbit shut it down after the HubSpot acquisition — the domain no
  // longer resolves. Google's favicon service does the same job (favicon
  // by domain) without needing infrastructure of our own, and is still live.
  return sanitizedDomain
    ? `https://www.google.com/s2/favicons?domain=${sanitizedDomain}&sz=128`
    : undefined;
};
