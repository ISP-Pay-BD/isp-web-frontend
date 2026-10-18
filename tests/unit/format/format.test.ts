import { afterEach, describe, expect, it } from 'vitest';
import { formatBdt, formatBdtCompact, formatBdtWithSymbol, formatCount, setFormatLocale, formatDate, formatRelativeDays } from '@/lib/format';

afterEach(() => setFormatLocale('en'));

describe('format / money and counts (lakh and crore)', () => {
  it('groups the Bangladeshi way', () => {
    expect(formatBdt(4825000)).toBe('48,25,000');
    expect(formatBdtWithSymbol(1200)).toBe('৳1,200');
    expect(formatCount(1234567)).toBe('12,34,567');
  });

  it('keeps up to two fraction digits for money and none for counts', () => {
    expect(formatBdt(1200.5)).toBe('1,200.5');
    expect(formatCount(1200.7)).toBe('1,201');
  });

  it('writes compact money in lakh and crore', () => {
    expect(formatBdtCompact(4825000)).toBe('৳48.3L');
    expect(formatBdtCompact(125000000)).toBe('৳12.5Cr');
  });

  it('keeps Latin digits in Bangla while following the language for months', () => {
    setFormatLocale('bn');
    expect(formatBdt(4825000)).toBe('48,25,000');
    expect(formatDate('2026-10-18T06:00:00Z')).toContain('2026');
    expect(formatDate('2026-10-18T06:00:00Z')).not.toMatch(/Oct/);
    expect(formatRelativeDays(new Date(Date.now() + 3 * 86400000))).toMatch(/দিন পরে/);
  });
});
