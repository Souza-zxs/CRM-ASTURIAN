import { Faq } from '@/sections/faq';
import { Menu } from '@/sections/menu';
import { PricingEngagementBand } from '@/sections/pricing-engagement-band';
import { PlanTable } from '@/sections/pricing-plan-table';
import { PricingPlans } from '@/sections/pricing-plans';
import { PricingSalesfarce } from '@/sections/pricing-salesfarce';

export const PricingPage = () => (
  <>
    <Menu scheme="muted" />
    <main>
      <PricingPlans />
      <PricingEngagementBand />
      <PlanTable />
      <PricingSalesfarce />
      <Faq />
    </main>
  </>
);
