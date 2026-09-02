import { formatDate, formatDateTime } from '@/lib/format';
import { cn } from '@/lib/utils';

interface DateDisplayProps {
  value: string | Date | number;
  mode?: 'date' | 'datetime';
  className?: string;
}

export function DateDisplay({ value, mode = 'date', className }: DateDisplayProps) {
  const formatted = mode === 'datetime' ? formatDateTime(value) : formatDate(value);
  return (
    <time dateTime={typeof value === 'string' ? value : undefined} className={cn('tabular-nums', className)}>
      {formatted}
    </time>
  );
}
