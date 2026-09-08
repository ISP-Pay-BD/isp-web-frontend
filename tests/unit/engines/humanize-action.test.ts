import { describe, expect, it } from 'vitest';
import { humanizeAction } from '@/features/admin/engines/lib/humanize-action';

describe('humanizeAction', () => {
  it('maps snake_case ops verbs to operator labels', () => {
    expect(humanizeAction('retry_all')).toBe('Retry all');
    expect(humanizeAction('run_now')).toBe('Run now');
    expect(humanizeAction('enable')).toBe('Enable');
  });

  it('falls back to spaced words', () => {
    expect(humanizeAction('some_new_action')).toBe('some new action');
  });
});
