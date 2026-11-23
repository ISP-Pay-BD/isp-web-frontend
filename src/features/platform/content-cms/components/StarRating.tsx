'use client';

import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

/** 1–5 stars; interactive (radio group) when `onChange` is given. */
export function StarRating({
  value,
  onChange,
  label,
  size = 'sm',
}: {
  value: number;
  onChange?: (value: number) => void;
  label: string;
  size?: 'sm' | 'lg';
}) {
  const icon = size === 'lg' ? 'h-7 w-7' : 'h-3.5 w-3.5';
  if (!onChange) {
    return (
      <span className="inline-flex items-center gap-0.5" role="img" aria-label={label}>
        {[1, 2, 3, 4, 5].map((n) => (
          <Star
            key={n}
            className={cn(
              icon,
              n <= value ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/40',
            )}
            aria-hidden
          />
        ))}
      </span>
    );
  }
  return (
    <div className="inline-flex items-center gap-1" role="radiogroup" aria-label={label}>
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          role="radio"
          aria-checked={value === n}
          aria-label={`${n}/5`}
          onClick={() => onChange(n)}
          className="focus-visible:ring-ring rounded-md p-0.5 transition duration-200 ease-out hover:scale-110 focus-visible:ring-2 focus-visible:outline-none"
        >
          <Star
            className={cn(
              icon,
              n <= value ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/40',
            )}
            aria-hidden
          />
        </button>
      ))}
    </div>
  );
}
