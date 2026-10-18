import { describe, expect, it } from 'vitest';
import { readTableUrlState, writeTableUrlState } from '@/features/shared/data-table/lib/url-state';

describe('data-table / URL state', () => {
  it('reads search, page, size, sort and facets from a query string', () => {
    const state = readTableUrlState(new URLSearchParams('q=rahim&page=3&size=50&sort=name:desc&f_status=active,expired'));
    expect(state).toEqual({
      search: 'rahim',
      page: 3,
      pageSize: 50,
      sorting: [{ id: 'name', desc: true }],
      facets: [{ id: 'status', value: ['active', 'expired'] }],
    });
  });

  it('falls back to safe defaults on a missing or broken query', () => {
    const state = readTableUrlState(new URLSearchParams('page=abc&size=-1'));
    expect(state.page).toBe(1);
    expect(state.pageSize).toBeNull();
    expect(state.sorting).toEqual([]);
  });

  it('omits default values and leaves unrelated params alone', () => {
    const params = new URLSearchParams('tab=billing&q=old');
    writeTableUrlState(
      params,
      { search: '', page: 1, pageSize: 20, sorting: [], facets: [] },
      { pageSize: 20, sorting: [] },
    );
    expect(params.toString()).toBe('tab=billing');
  });

  it('writes a non-default view and round-trips it', () => {
    const params = new URLSearchParams();
    writeTableUrlState(
      params,
      { search: ' rahim ', page: 2, pageSize: 50, sorting: [{ id: 'balance', desc: false }], facets: [{ id: 'status', value: ['expired'] }] },
      { pageSize: 20, sorting: [] },
    );
    expect(params.get('q')).toBe('rahim');
    expect(params.get('page')).toBe('2');
    expect(params.get('size')).toBe('50');
    expect(params.get('sort')).toBe('balance:asc');
    expect(params.get('f_status')).toBe('expired');
    expect(readTableUrlState(params).facets).toEqual([{ id: 'status', value: ['expired'] }]);
  });
});
