import { msg } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';

import { Menu } from '@/sections/menu';
import { Body, Heading, SectionShell } from '@/ui';

export const NotFoundPage = () => {
  const { i18n } = useLingui();

  return (
    <>
      <Menu />
      <main>
        <SectionShell rhythm="section" scheme="light">
          <Heading as="h1" size="lg" weight="light">
            {i18n._(msg`Page not found`)}
          </Heading>
          <Body>{i18n._(msg`The page you're looking for doesn't exist.`)}</Body>
        </SectionShell>
      </main>
    </>
  );
};
