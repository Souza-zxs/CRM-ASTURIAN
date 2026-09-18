import { Faq } from '@/sections/faq';
import { FeatureCards } from '@/sections/feature-cards';
import { HomeHero } from '@/sections/home-hero';
import { Menu } from '@/sections/menu';
import { Problem } from '@/sections/problem';
import { Stepper } from '@/sections/stepper';
import { ThreeCards } from '@/sections/three-cards';

export const HomePage = () => (
  <>
    <Menu scheme="muted" />
    <main>
      <HomeHero />
      <Problem />
      <ThreeCards />
      <Stepper />
      <FeatureCards />
      <Faq />
    </main>
  </>
);
