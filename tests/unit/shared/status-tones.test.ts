import { describe, expect, it } from 'vitest';
import { toneOfStatus, statusTone, toneClasses } from '@/components/shared/status-tones';

describe('shared / status tones', () => {
  it('maps the words the API returns to one tone each', () => {
    expect(toneOfStatus('Active')).toBe('success');
    expect(toneOfStatus('expired')).toBe('danger');
    expect(toneOfStatus('PENDING')).toBe('warning');
    expect(toneOfStatus('suspended')).toBe('neutral');
    expect(toneOfStatus('refunded')).toBe('info');
  });

  it('falls back to neutral for unknown words', () => {
    expect(toneOfStatus('something-new')).toBe('neutral');
  });

  it('has classes for every tone that a status can map to', () => {
    for (const tone of new Set(Object.values(statusTone))) expect(toneClasses[tone]).toBeTruthy();
  });
});
