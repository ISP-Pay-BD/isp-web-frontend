import { mockDelay } from '../delay';
import { landingData, pricingPlans } from '@/data/marketing/landing.data';
import { paygCalculator, pricingTiers, calculatePaygMonthly } from '@/data/marketing/pricing.data';
import { landingSections, landingFaqExtended, landingTestimonialsExtended } from '@/data/marketing/sections.data';
import { pluginsMarketplaceFull, pluginCategories } from '@/data/marketing/plugins.data';

export async function getLandingData() {
  await mockDelay();
  return {
    ...landingData,
    plugins: pluginsMarketplaceFull,
    sections: landingSections,
    faqExtended: landingFaqExtended,
    testimonialsExtended: landingTestimonialsExtended,
  };
}

export async function getPricingData() {
  await mockDelay();
  return {
    plans: pricingPlans,
    tiers: pricingTiers,
    payg: paygCalculator,
    calculatePayg: calculatePaygMonthly,
  };
}

export async function getPluginsData() {
  await mockDelay();
  return {
    plugins: pluginsMarketplaceFull,
    categories: pluginCategories,
  };
}

export async function getContactData() {
  await mockDelay();
  return landingData.contact;
}
