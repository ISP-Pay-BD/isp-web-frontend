'use client';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';

export interface SelectOption {
  value: string;
  label: string;
}

interface OptionSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  /** Adds a leading option with value '' (e.g. "All providers"). */
  emptyLabel?: string;
  disabled?: boolean;
  className?: string;
  id?: string;
  invalid?: boolean;
}

/** Select whose trigger shows the option label (not the raw id value). */
export function OptionSelect({ value, onChange, options, placeholder, emptyLabel, disabled, className, id, invalid }: OptionSelectProps) {
  const all = emptyLabel !== undefined ? [{ value: '', label: emptyLabel }, ...options] : options;
  return (
    <Select
      value={value === '' && emptyLabel === undefined ? null : value}
      onValueChange={(v) => onChange(typeof v === 'string' ? v : '')}
      items={all}
      disabled={disabled}
    >
      <SelectTrigger id={id} aria-label={id ? undefined : (placeholder ?? emptyLabel)} aria-invalid={invalid || undefined} className={cn('text-xs h-9 w-full', className)}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {all.map((o) => (
          <SelectItem key={o.value || '__empty'} value={o.value} className="text-xs">
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

/** Inline field error under an input. */
export function FieldError({ message }: { message?: string }) {
  return message ? <p className="text-xs text-destructive">{message}</p> : null;
}
