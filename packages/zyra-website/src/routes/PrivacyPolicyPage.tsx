import { msg } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';

import { useLocale } from '@/platform/i18n';
import { buildBreadcrumbListJsonLd, JsonLd } from '@/platform/seo';
import { LegalDocument, PrivacyPolicyDocument } from '@/sections/legal';
import { Menu } from '@/sections/menu';

export const PrivacyPolicyPage = () => {
  const { i18n } = useLingui();
  const locale = useLocale();

  return (
    <>
      <JsonLd
        data={buildBreadcrumbListJsonLd(
          [
            { name: 'Home', path: '/' },
            { name: 'Privacy Policy', path: '/privacy-policy' },
          ],
          locale,
        )}
      />
      <Menu />
      <main>
        <LegalDocument title={i18n._(msg`Privacy Policy`)}>
          <PrivacyPolicyDocument />
        </LegalDocument>
      </main>
    </>
  );
};
