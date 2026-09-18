import { PartnerApplicationModalRoot } from '@/partner-application';
import { useLocale } from '@/platform/i18n';
import { buildBreadcrumbListJsonLd, JsonLd } from '@/platform/seo';
import { Faq } from '@/sections/faq';
import { Menu } from '@/sections/menu';
import { PartnerHero } from '@/sections/partner-hero';
import { PartnerSignoff } from '@/sections/partner-signoff';
import { PartnerTestimonials } from '@/sections/testimonials';

// Sections land in old-site order as their ports arrive.
export const PartnersPage = () => {
  const locale = useLocale();

  return (
    <PartnerApplicationModalRoot>
      <JsonLd
        data={buildBreadcrumbListJsonLd(
          [
            { name: 'Home', path: '/' },
            { name: 'Partners', path: '/partners' },
          ],
          locale,
        )}
      />
      <Menu />
      <main>
        <PartnerHero />
        <PartnerTestimonials />
        <PartnerSignoff />
        <Faq />
      </main>
    </PartnerApplicationModalRoot>
  );
};
