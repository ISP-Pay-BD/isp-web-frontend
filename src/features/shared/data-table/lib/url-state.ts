import type { ColumnFiltersState, SortingState } from '@tanstack/react-table';

/** Table state that lives in the query string, so Back, refresh and shared links keep the view. */
export interface TableUrlState {
  search: string;
  /** 1-based; 1 when absent. */
  page: number;
  pageSize: number | null;
  sorting: SortingState;
  facets: ColumnFiltersState;
}

const FACET_PREFIX = 'f_';

export function readTableUrlState(params: URLSearchParams): TableUrlState {
  const sort = params.get('sort');
  const [sortId, dir] = sort ? sort.split(':') : [];
  const facets: ColumnFiltersState = [];
  params.forEach((value, key) => {
    if (key.startsWith(FACET_PREFIX) && value) facets.push({ id: key.slice(FACET_PREFIX.length), value: value.split(',') });
  });
  const size = Number(params.get('size'));
  return {
    search: params.get('q') ?? '',
    page: Math.max(1, Number(params.get('page')) || 1),
    pageSize: Number.isFinite(size) && size > 0 ? size : null,
    sorting: sortId ? [{ id: sortId, desc: dir === 'desc' }] : [],
    facets,
  };
}

/** Applies `state` onto `params`; values equal to the defaults are removed to keep links short. */
export function writeTableUrlState(
  params: URLSearchParams,
  state: { search: string; page: number; pageSize: number; sorting: SortingState; facets: ColumnFiltersState },
  defaults: { pageSize: number; sorting: SortingState },
) {
  const set = (key: string, value: string | null) => (value ? params.set(key, value) : params.delete(key));
  set('q', state.search.trim() || null);
  set('page', state.page > 1 ? String(state.page) : null);
  set('size', state.pageSize !== defaults.pageSize ? String(state.pageSize) : null);
  const [s] = state.sorting;
  const [d] = defaults.sorting;
  const sameSort = s?.id === d?.id && Boolean(s?.desc) === Boolean(d?.desc);
  set('sort', s && !sameSort ? `${s.id}:${s.desc ? 'desc' : 'asc'}` : null);
  [...params.keys()].filter((k) => k.startsWith(FACET_PREFIX)).forEach((k) => params.delete(k));
  state.facets.forEach((f) => {
    if (Array.isArray(f.value) && f.value.length) params.set(FACET_PREFIX + f.id, f.value.join(','));
  });
}
