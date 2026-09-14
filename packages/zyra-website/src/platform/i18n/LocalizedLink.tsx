'use client';

import { type ComponentProps } from 'react';
import { Link } from 'react-router-dom';

import { localizeHref } from './localize-href';
import { useLocale } from './use-locale';

export type LocalizedLinkProps = Omit<ComponentProps<typeof Link>, 'to'> & {
  href: string;
};

// Drop-in react-router Link that prefixes internal hrefs with the active
// locale, so call sites always write unprefixed paths.
export function LocalizedLink({ href, ...props }: LocalizedLinkProps) {
  const locale = useLocale();
  return <Link {...props} to={localizeHref(locale, href)} />;
}
