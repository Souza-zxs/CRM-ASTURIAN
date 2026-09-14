import { useLocale } from '@/platform/i18n';
import { buildBreadcrumbListJsonLd, JsonLd } from '@/platform/seo';
import { CustomersCatalogSignoff } from '@/sections/customers-catalog-signoff';
import { CustomersHero } from '@/sections/customers-hero';
import { Faq } from '@/sections/faq';
import { Menu } from '@/sections/menu';

const CustomersPage = () => {
  const locale = useLocale();

  return (
    <>
      <JsonLd
        data={buildBreadcrumbListJsonLd(
          [
            { name: 'Home', path: '/' },
            { name: 'Customers', path: '/customers' },
          ],
          locale,
        )}
      />
      <Menu scheme="muted" />
      <main>
        <CustomersHero />
        <CustomersCatalogSignoff />
        <Faq />
      </main>
    </>
  );
};

export default CustomersPage;
