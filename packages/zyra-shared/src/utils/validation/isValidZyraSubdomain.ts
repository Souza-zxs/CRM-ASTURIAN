import { SUBDOMAIN_PATTERN } from '@/constants/SubdomainPattern';

export const isValidZyraSubdomain = (subdomain: string): boolean => {
  return SUBDOMAIN_PATTERN.test(subdomain);
};
