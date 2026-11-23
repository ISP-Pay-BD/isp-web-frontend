import { http } from '@/lib/api/client';
import { num, str } from '@/lib/api/case';

type Raw = Record<string, unknown>;

/** One scheduled worker (Rust `GET /v1/platform/cron/status` → `jobs[]`; PHP `CronJob::statusSummary`). */
export interface CronJob {
  name: string;
  label: string;
  schedule: string | null;
  lastStartedAt: string | null;
  lastFinishedAt: string | null;
  /** `ok` | `failed` | `skipped` | `running`, or `never` when the job has no recorded run. */
  lastStatus: string;
  lastError: string | null;
  lastDurationMs: number | null;
  lastTrigger: string | null;
  /** Lock held AND the run-state says a holder is mid-run (Rust lane R11). */
  running: boolean;
  /** A `job_lock:*` key exists. Locked but not running = a stale lock left by a crash ("stuck"). */
  locked: boolean;
  lockTtlMs: number | null;
  runCount: number;
  failCount: number;
  canRun: boolean;
}

export interface CronStatus {
  /** RFC 3339 with offset (Rust: Asia/Dhaka, `+06:00`). */
  serverTime: string | null;
  /** IANA zone the server clock reports in (`Asia/Dhaka`), null on older APIs. */
  timezone: string | null;
  workersEnabled: boolean;
  redisOk: boolean;
  jobs: CronJob[];
  activeExpired: number;
  inactiveConnected: number;
  smsToday: number;
}

export interface CronResetResult {
  cleared: number;
  skippedLive: string[];
  message: string | null;
}

const opt = (v: unknown): string | null =>
  v === null || v === undefined || v === '' ? null : String(v);
const optNum = (v: unknown): number | null =>
  v === null || v === undefined || v === '' ? null : num(v);

/** RFC 3339 is kept as sent; a legacy zone-less `YYYY-MM-DD HH:MM:SS` was UTC. */
export function serverTime(v: unknown): string | null {
  const raw = opt(v);
  if (!raw) return null;
  const iso = raw.replace(' ', 'T');
  return /(Z|[+-]\d{2}:?\d{2})$/i.test(iso) ? iso : `${iso}Z`;
}

function mapJob(r: Raw, lockTtl: Map<string, number>): CronJob {
  const name = str(r.job);
  const ttl = optNum(r.lock_ttl_ms) ?? lockTtl.get(name) ?? null;
  return {
    name,
    label: str(r.label) || name,
    schedule: opt(r.schedule),
    lastStartedAt: opt(r.last_started_at),
    lastFinishedAt: opt(r.last_finished_at),
    lastStatus: str(r.last_status) || 'never',
    lastError: opt(r.last_error),
    lastDurationMs: optNum(r.last_duration_ms),
    lastTrigger: opt(r.last_trigger),
    running: r.running === true,
    // Older APIs had no `locked` field and reported every held lock as `running`.
    locked: typeof r.locked === 'boolean' ? r.locked : ttl !== null,
    lockTtlMs: ttl,
    runCount: num(r.run_count),
    failCount: num(r.fail_count),
    canRun: r.can_run !== false,
  };
}

/** Contract: Rust lane R9 (`.lanes/run-2026-11-23/R9-cron-reward-report-inv.md` → "Paths for Next.js"). super_admin only. */
export const cronApi = {
  status: async (): Promise<CronStatus> => {
    const d = (await http.get<Raw>('/v1/platform/cron/status')) ?? {};
    const locks = new Map<string, number>(
      ((d.active_locks ?? []) as Raw[]).map((l) => [str(l.job), num(l.ttl_ms)] as [string, number]),
    );
    const expired = (d.expired_counts ?? {}) as Raw;
    const sms = (d.sms_stats ?? {}) as Raw;
    return {
      serverTime: serverTime(d.server_time),
      timezone: opt(d.timezone),
      workersEnabled: d.workers_enabled !== false,
      redisOk: d.redis_ok !== false,
      jobs: ((d.jobs ?? []) as Raw[]).map((r) => mapJob(r, locks)).filter((j) => j.name),
      activeExpired: num(expired.active_expired),
      inactiveConnected: num(expired.inactive_conn),
      smsToday: num(sms.total_today),
    };
  },

  /** Clears stuck locks. Without `force` the API leaves locks of jobs that are really running (`skippedLive`). */
  reset: async (opts?: { job?: string; force?: boolean }): Promise<CronResetResult> => {
    const d = ((await http.post<Raw>('/v1/platform/cron/reset', opts ?? {})) ?? {}) as Raw;
    return {
      cleared: num(d.cleared_locks),
      skippedLive: Array.isArray(d.skipped_live) ? d.skipped_live.map(String) : [],
      message: opt(d.message),
    };
  },

  /** Starts one job in the background (202); 409 when its lock is held. Poll `status` for the result. */
  run: async (job: string): Promise<void> => {
    await http.post<Raw>(`/v1/platform/cron/run/${encodeURIComponent(job)}`);
  },
};
