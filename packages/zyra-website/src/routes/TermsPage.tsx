import { msg } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';

import { useLocale } from '@/platform/i18n';
import { buildBreadcrumbListJsonLd, JsonLd } from '@/platform/seo';
import { LegalDocument, TermsDocument } from '@/sections/legal';
import { Menu } from '@/sections/menu';

const TermsPage = () => {
  const { i18n } = useLingui();
  const locale = useLocale();

  return (
    <>
      <JsonLd
        data={buildBreadcrumbListJsonLd(
          [
            { name: 'Home', path: '/' },
            { name: 'Terms of Service', path: '/terms' },
          ],
          locale,
        )}
      />
      <Menu />
      <main>
        <LegalDocument title={i18n._(msg`Terms of Service`)}>
          <TermsDocument />
        </LegalDocument>
      </main>
    </>
  );
};

export default TermsPage;
