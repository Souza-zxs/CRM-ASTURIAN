import { useLocale } from '@/platform/i18n';
import { buildBreadcrumbListJsonLd, JsonLd } from '@/platform/seo';
import { Menu } from '@/sections/menu';
import { WhyZyraEditorials } from '@/sections/why-zyra-editorial';
import { WhyZyraHero } from '@/sections/why-zyra-hero';
import { WhyZyraMarquee } from '@/sections/why-zyra-marquee';
import { WhyZyraSignoff } from '@/sections/why-zyra-signoff';

export const WhyZyraPage = () => {
  const locale = useLocale();

  return (
    <>
      <JsonLd
        data={buildBreadcrumbListJsonLd(
          [
            { name: 'Início', path: '/' },
            { name: 'Por que a Zyra', path: '/why-zyra' },
          ],
          locale,
        )}
      />
      <Menu scheme="dark" />
      <main>
        <WhyZyraHero />
        <WhyZyraEditorials />
        <WhyZyraMarquee />
        <WhyZyraSignoff />
      </main>
    </>
  );
};
