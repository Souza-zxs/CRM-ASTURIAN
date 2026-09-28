import { useLocale } from '@/platform/i18n';
import { buildBreadcrumbListJsonLd, JsonLd } from '@/platform/seo';
import { Creators } from '@/sections/creators';
import { Faq } from '@/sections/faq';
import { Founders } from '@/sections/founders';
import { FoundersHero } from '@/sections/founders-hero';
import { Menu } from '@/sections/menu';

export const PartnersPage = () => {
  const locale = useLocale();

  return (
    <>
      <JsonLd
        data={buildBreadcrumbListJsonLd(
          [
            { name: 'Home', path: '/' },
            { name: 'Quem criou o Zyra', path: '/partners' },
          ],
          locale,
        )}
      />
      <Menu />
      <main>
        <FoundersHero />
        <Founders />
        <Creators />
        <Faq />
      </main>
    </>
  );
};
