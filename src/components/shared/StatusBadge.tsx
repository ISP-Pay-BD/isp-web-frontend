import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

const statusStyles: Record<string, string> = {
  active: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400',
  expired: 'bg-red-500/15 text-red-700 dark:text-red-400',
  expiring: 'bg-amber-500/15 text-amber-700 dark:text-amber-400',
  suspended: 'bg-slate-500/15 text-slate-700 dark:text-slate-400',
  online: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400',
  offline: 'bg-slate-500/15 text-slate-600 dark:text-slate-400',
  pending: 'bg-amber-500/15 text-amber-700 dark:text-amber-400',
  paid: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400',
  approved: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400',
  rejected: 'bg-red-500/15 text-red-700 dark:text-red-400',
  present: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400',
  late: 'bg-amber-500/15 text-amber-700 dark:text-amber-400',
};

interface StatusBadgeProps {
  status: string;
  label?: string;
  className?: string;
}

export function StatusBadge({ status, label, className }: StatusBadgeProps) {
  const key = status.toLowerCase();
  return (
    <Badge variant="secondary" className={cn('font-medium capitalize', statusStyles[key], className)}>
      {label ?? status}
    </Badge>
  );
}
