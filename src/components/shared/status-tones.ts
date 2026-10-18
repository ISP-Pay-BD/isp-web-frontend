/** One colour map for every status chip in the portals (Badge `tone`, StatusBadge). */
export type Tone = 'success' | 'warning' | 'danger' | 'info' | 'neutral';

export const toneClasses: Record<Tone, string> = {
  success: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
  warning: 'border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400',
  danger: 'border-rose-500/30 bg-rose-500/10 text-rose-700 dark:text-rose-400',
  info: 'border-sky-500/30 bg-sky-500/10 text-sky-700 dark:text-sky-400',
  neutral: 'border-slate-500/30 bg-slate-500/10 text-slate-700 dark:text-slate-300',
};

export const toneDots: Record<Tone, string> = {
  success: 'bg-emerald-500',
  warning: 'bg-amber-500',
  danger: 'bg-rose-500',
  info: 'bg-sky-500',
  neutral: 'bg-slate-400',
};

/** Status word (as returned by the zapi adapters, lower-cased) -> tone. Unknown words fall back to neutral. */
export const statusTone: Record<string, Tone> = {
  // healthy / finished
  active: 'success', online: 'success', paid: 'success', completed: 'success', approved: 'success',
  present: 'success', verified: 'success', resolved: 'success', success: 'success', delivered: 'success',
  connected: 'success', enabled: 'success', open: 'success', received: 'success', done: 'success',
  // needs attention soon
  pending: 'warning', expiring: 'warning', late: 'warning', partial: 'warning', processing: 'warning',
  in_progress: 'warning', 'in progress': 'warning', scheduled: 'warning', queued: 'warning', unverified: 'warning',
  draft: 'warning', warning: 'warning', due: 'warning', review: 'warning',
  // problem
  expired: 'danger', rejected: 'danger', failed: 'danger', overdue: 'danger', cancelled: 'danger',
  canceled: 'danger', blocked: 'danger', error: 'danger', absent: 'danger', unpaid: 'danger', los: 'danger',
  // informational
  refunded: 'info', info: 'info', new: 'info', sent: 'info', trial: 'info',
  // switched off
  suspended: 'neutral', offline: 'neutral', inactive: 'neutral', disabled: 'neutral', closed: 'neutral',
  disconnected: 'neutral', archived: 'neutral',
};

export function toneOfStatus(status: string): Tone {
  return statusTone[status.toLowerCase()] ?? 'neutral';
}
