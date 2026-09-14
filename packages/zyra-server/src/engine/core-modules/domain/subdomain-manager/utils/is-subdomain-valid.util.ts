import { RESERVED_SUBDOMAINS } from 'zyra-shared/constants';
import { isValidZyraSubdomain } from 'zyra-shared/utils';

export const isSubdomainValid = (subdomain: string) => {
  return (
    isValidZyraSubdomain(subdomain) &&
    !RESERVED_SUBDOMAINS.includes(subdomain.toLowerCase())
  );
};
