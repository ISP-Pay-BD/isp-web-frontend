import { describe, expect, it } from 'vitest';
import { landingSectionsAData } from '@/data/marketing/landing-sections-a.data';

describe('landing sections A (WT01)', () => {
  it('exports every landing section payload', () => {
    expect(landingSectionsAData.hero.badge).toBeTruthy();
    expect(landingSectionsAData.stats.uptimeSla).toBeTruthy();
    // Platform counts are live (GET /api/v1/public/stats), never site copy.
    expect(landingSectionsAData.stats).not.toHaveProperty('trustedIsps');
    expect(landingSectionsAData.features.length).toBeGreaterThanOrEqual(6);
    expect(landingSectionsAData.benefits).toHaveLength(3);
    expect(landingSectionsAData.whyChoose).toHaveLength(4);
    expect(landingSectionsAData.howItWorks).toHaveLength(4);
    expect(landingSectionsAData.productPreview.length).toBeGreaterThanOrEqual(4);
    expect(landingSectionsAData.reconciliation).toHaveLength(3);
    expect(landingSectionsAData.comparison.rows.length).toBeGreaterThanOrEqual(6);
    expect(landingSectionsAData.testimonials.length).toBeGreaterThanOrEqual(8);
    expect(landingSectionsAData.faq.length).toBeGreaterThanOrEqual(6);
    expect(landingSectionsAData.integrations.length).toBeGreaterThanOrEqual(8);
  });
});
