import { mockDelay } from '../delay';
import { landingData, pricingPlans } from '@/data/marketing/landing.data';
import { paygCalculator, pricingTiers, calculatePaygMonthly, comparisonGroups, comparisonPlans } from '@/data/marketing/pricing.data';
import { landingSections, landingFaqExtended, landingTestimonialsExtended } from '@/data/marketing/sections.data';
import { landingSectionsAData } from '@/data/marketing/landing-sections-a.data';
import { pluginsMarketplaceFull, pluginCategories } from '@/data/marketing/plugins.data';
import { publicStatus } from '@/data/admin/isp-ops.data';

export async function getLandingData() {
  await mockDelay();
  return {
    ...landingData,
    plugins: pluginsMarketplaceFull,
    sections: landingSections,
    faqExtended: landingFaqExtended,
    testimonialsExtended: landingTestimonialsExtended,
    /** WT01 — sections 1–14 composed payload for LandingPage */
    sectionsA: landingSectionsAData,
  };
}

export async function getPricingData() {
  await mockDelay();
  return {
    plans: pricingPlans,
    tiers: pricingTiers,
    payg: paygCalculator,
    calculatePayg: calculatePaygMonthly,
    comparisonGroups,
    comparisonPlans,
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

export async function getPublicStatusData() {
  await mockDelay();
  return publicStatus;
}
