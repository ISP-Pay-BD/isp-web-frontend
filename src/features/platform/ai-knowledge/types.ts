import { num, str } from '@/lib/api/case';

export const KB_CATEGORIES = ['billing', 'technical', 'packages', 'contact', 'general'] as const;
export const KB_MATCH_TYPES = ['exact', 'keywords', 'ai_context'] as const;
export type KbMatchType = (typeof KB_MATCH_TYPES)[number];
export type KbStatus = 'active' | 'inactive';

/** Rust `AiKnowledgeEntry` (src/modules/ai_chat/domain/knowledge.rs). */
export interface KnowledgeEntry {
  id: string;
  category: string;
  question: string;
  answer: string;
  keywords: string;
  matchType: KbMatchType;
  priority: number;
  hitCount: number;
  status: KbStatus;
  createdAt: string;
  updatedAt: string;
}

export interface KnowledgeStats {
  total: number;
  active: number;
  hits: number;
  categories: { category: string; count: number }[];
}

/** Rust `TestKnowledgeQueryResult` (PHP `testQuery`). */
export interface KnowledgeTestResult {
  matched: boolean;
  matchType: string;
  entry: KnowledgeEntry | null;
  /** `direct_match` | `rag_context` | `no_local_match`. */
  resolution: string;
  /** Lookup time on the server (ms). */
  latencyMs: number | null;
  /** Up to 3 related entries the AI engine gets as context (`matched_items`). */
  related: KnowledgeEntry[];
  explanation: string;
}

type Obj = Record<string, unknown>;
const obj = (v: unknown): Obj => (v && typeof v === 'object' ? (v as Obj) : {});

export function mapEntry(raw: unknown): KnowledgeEntry {
  const r = obj(raw);
  const mt = str(r.match_type);
  return {
    id: str(r.id),
    category: str(r.category, 'general'),
    question: str(r.question),
    answer: str(r.answer),
    keywords: str(r.keywords),
    matchType: (KB_MATCH_TYPES as readonly string[]).includes(mt)
      ? (mt as KbMatchType)
      : 'ai_context',
    priority: num(r.priority),
    hitCount: num(r.hit_count),
    status: str(r.status) === 'inactive' ? 'inactive' : 'active',
    createdAt: str(r.created_at),
    updatedAt: str(r.updated_at),
  };
}

export function mapEntries(raw: unknown): KnowledgeEntry[] {
  const list = Array.isArray(raw) ? raw : (obj(raw).items ?? obj(raw).data);
  return (Array.isArray(list) ? list : []).map(mapEntry);
}

export function mapTestResult(raw: unknown): KnowledgeTestResult {
  const r = obj(raw);
  const entry = r.entry ?? r.matched_item;
  const latency = Number(r.latency_ms);
  return {
    matched: r.matched === true,
    matchType: str(r.match_type),
    entry: entry ? mapEntry(entry) : null,
    resolution: str(r.resolution),
    latencyMs: r.latency_ms === undefined || !Number.isFinite(latency) ? null : latency,
    related: Array.isArray(r.matched_items) ? r.matched_items.map(mapEntry) : [],
    explanation: str(r.explanation),
  };
}

/** `GET /v1/admin/ai-knowledge/stats` → `{total_items, active_items, total_hits, categories: [{category, count}]}`. */
export function mapStats(raw: unknown): KnowledgeStats {
  const r = obj(raw);
  const cats = Array.isArray(r.categories) ? r.categories : [];
  return {
    total: num(r.total_items),
    active: num(r.active_items),
    hits: num(r.total_hits),
    categories: cats
      .map((c) => ({ category: str(obj(c).category), count: num(obj(c).count) }))
      .filter((c) => c.category !== ''),
  };
}
