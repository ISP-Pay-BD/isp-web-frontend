'use client';

import { useMemo } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';

export interface SelectOption {
  value: string;
  label: string;
}

const NONE = '__none__';

interface OptionSelectProps {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  /** Adds an explicit "empty" choice (maps to ''), e.g. "All locations". */
  noneLabel?: string;
  disabled?: boolean;
  invalid?: boolean;
  className?: string;
}

/** Select over API-provided options; '' = nothing selected. Shows labels (not raw ids) in the trigger. */
export function OptionSelect({
  id,
  value,
  onChange,
  options,
  placeholder,
  noneLabel,
  disabled,
  invalid,
  className,
}: OptionSelectProps) {
  const items = useMemo(() => {
    const record: Record<string, string> = {};
    if (noneLabel) record[NONE] = noneLabel;
    for (const o of options) record[o.value] = o.label;
    return record;
  }, [options, noneLabel]);

  return (
    <Select
      items={items}
      value={value || (noneLabel ? NONE : null)}
      onValueChange={(v) => onChange(v === null || v === undefined || v === NONE ? '' : String(v))}
      disabled={disabled}
    >
      <SelectTrigger id={id} className={cn('w-full', className)} aria-invalid={invalid || undefined}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {noneLabel ? <SelectItem value={NONE}>{noneLabel}</SelectItem> : null}
        {options.map((o) => (
          <SelectItem key={o.value} value={o.value}>
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
