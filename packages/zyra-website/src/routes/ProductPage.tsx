import { useLocale } from '@/platform/i18n';
import { MenuStyleProvider } from '@/platform/menu-style';
import { buildBreadcrumbListJsonLd, JsonLd } from '@/platform/seo';
import { Faq } from '@/sections/faq';
import { Menu } from '@/sections/menu';
import { ProductDemo } from '@/sections/product-demo';
import { ProductFeature } from '@/sections/product-feature';
import { ProductHero } from '@/sections/product-hero';
import { ProductStepper } from '@/sections/stepper';
import { ProductThreeCards } from '@/sections/three-cards';

export const ProductPage = () => {
  const locale = useLocale();

  return (
    <>
      <JsonLd
        data={buildBreadcrumbListJsonLd(
          [
            { name: 'Home', path: '/' },
            { name: 'Product', path: '/product' },
          ],
          locale,
        )}
      />
      <MenuStyleProvider>
        <Menu />
        <main>
          <ProductHero />
          <ProductFeature />
          <ProductThreeCards />
          <ProductStepper />
          <ProductDemo />
          <Faq />
        </main>
      </MenuStyleProvider>
    </>
  );
};
