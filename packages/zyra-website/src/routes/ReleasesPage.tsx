import { useLocale } from '@/platform/i18n';
import { buildBreadcrumbListJsonLd, JsonLd } from '@/platform/seo';
import { Menu } from '@/sections/menu';
import { ReleasesFeed } from '@/sections/releases-feed';
import { ReleasesHero } from '@/sections/releases-hero';

// Hero only for now; the release feed lands below it as its port arrives.
export const ReleasesPage = () => {
  const locale = useLocale();

  return (
    <>
      <JsonLd
        data={buildBreadcrumbListJsonLd(
          [
            { name: 'Home', path: '/' },
            { name: 'Releases', path: '/releases' },
          ],
          locale,
        )}
      />
      <Menu />
      <main>
        <ReleasesHero />
        <ReleasesFeed locale={locale} />
      </main>
    </>
  );
};
