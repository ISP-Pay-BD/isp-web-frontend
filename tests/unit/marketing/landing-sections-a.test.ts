import { describe, expect, it } from 'vitest';
import { landingSectionsAData } from '@/data/marketing/landing-sections-a.data';
import { calculatePaygMonthly } from '@/data/marketing/pricing.data';

describe('landing sections A (WT01)', () => {
  it('exports all 14 section payloads', () => {
    expect(landingSectionsAData.hero.badge).toBeTruthy();
    expect(landingSectionsAData.stats.trustedIsps).toBeGreaterThan(0);
    expect(landingSectionsAData.features.length).toBeGreaterThanOrEqual(6);
    expect(landingSectionsAData.benefits).toHaveLength(3);
    expect(landingSectionsAData.whyChoose).toHaveLength(4);
    expect(landingSectionsAData.howItWorks).toHaveLength(4);
    expect(landingSectionsAData.productPreview.length).toBeGreaterThanOrEqual(4);
    expect(landingSectionsAData.reconciliation).toHaveLength(3);
    expect(landingSectionsAData.pricing.plans.length).toBe(3);
    expect(landingSectionsAData.comparison.rows.length).toBeGreaterThanOrEqual(6);
    expect(landingSectionsAData.testimonials.length).toBe(24);
    expect(landingSectionsAData.faq.length).toBeGreaterThanOrEqual(6);
    expect(landingSectionsAData.integrations.length).toBeGreaterThanOrEqual(8);
  });

  it('PAYG calculator matches pricing.data helper', () => {
    const { payg } = landingSectionsAData.pricing;
    const subscribers = 500;
    const expected = calculatePaygMonthly(subscribers);
    const computed = payg.baseFeeBdt + subscribers * payg.pricePerCustomerBdt;
    expect(computed).toBe(expected);
  });
});
