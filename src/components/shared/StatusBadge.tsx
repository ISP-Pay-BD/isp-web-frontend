'use client';

import { cn } from '@/lib/utils';
import { useTranslations } from '@/i18n/locale-context';
import { Badge } from '@/components/ui/badge';
import { toneDots, toneOfStatus, type Tone } from './status-tones';

interface StatusBadgeProps {
  status: string;
  label?: string;
  /** Overrides the tone derived from `status`, for words that are not in the shared map. */
  tone?: Tone;
  className?: string;
}

export function StatusBadge({ status, label, tone, className }: StatusBadgeProps) {
  const t = useTranslations();
  const resolved = tone ?? toneOfStatus(status);
  return (
    <Badge
      variant="secondary"
      tone={resolved}
      className={cn('inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-medium capitalize', className)}
    >
      <span aria-hidden className={cn('h-1.5 w-1.5 shrink-0 rounded-full', toneDots[resolved])} />
      {label ?? t(`status.${status.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '')}`, status)}
    </Badge>
  );
}
