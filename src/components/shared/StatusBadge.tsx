import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

const statusStyles: Record<string, string> = {
  active: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 dark:bg-emerald-500/10 dark:border-emerald-500/30',
  expired: 'bg-red-500/15 text-red-700 dark:text-rose-400 dark:bg-rose-500/10 dark:border-rose-500/30',
  expiring: 'bg-amber-500/15 text-amber-700 dark:text-amber-400 dark:bg-amber-500/10 dark:border-amber-500/30',
  suspended: 'bg-slate-500/15 text-slate-700 dark:text-slate-300 dark:bg-slate-500/10 dark:border-slate-500/30',
  online: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 dark:bg-emerald-500/10 dark:border-emerald-500/30',
  offline: 'bg-slate-500/15 text-slate-600 dark:text-slate-400 dark:bg-slate-500/10 dark:border-slate-500/30',
  pending: 'bg-amber-500/15 text-amber-700 dark:text-amber-400 dark:bg-amber-500/10 dark:border-amber-500/30',
  paid: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 dark:bg-emerald-500/10 dark:border-emerald-500/30',
  completed: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 dark:bg-emerald-500/10 dark:border-emerald-500/30',
  approved: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 dark:bg-emerald-500/10 dark:border-emerald-500/30',
  rejected: 'bg-red-500/15 text-red-700 dark:text-rose-400 dark:bg-rose-500/10 dark:border-rose-500/30',
  present: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 dark:bg-emerald-500/10 dark:border-emerald-500/30',
  late: 'bg-amber-500/15 text-amber-700 dark:text-amber-400 dark:bg-amber-500/10 dark:border-amber-500/30',
};

interface StatusBadgeProps {
  status: string;
  label?: string;
  className?: string;
}

const dotStyles: Record<string, string> = {
  active: 'bg-emerald-500',
  online: 'bg-emerald-500',
  paid: 'bg-emerald-500',
  completed: 'bg-emerald-500',
  approved: 'bg-emerald-500',
  present: 'bg-emerald-500',
  expired: 'bg-rose-500',
  rejected: 'bg-rose-500',
  expiring: 'bg-amber-500',
  pending: 'bg-amber-500',
  late: 'bg-amber-500',
  suspended: 'bg-slate-400',
  offline: 'bg-slate-400',
};

export function StatusBadge({ status, label, className }: StatusBadgeProps) {
  const key = status.toLowerCase();
  const dotColor = dotStyles[key] ?? 'bg-muted-foreground';
  return (
    <Badge
      variant="secondary"
      className={cn(
        'inline-flex items-center gap-1.5 rounded-md border border-border/40 px-2 py-0.5 text-[11px] font-medium capitalize transition-colors',
        statusStyles[key],
        className,
      )}
    >
      <span className={cn('h-1.5 w-1.5 rounded-full shrink-0', dotColor)} />
      {label ?? status}
    </Badge>
  );
}
