'use client';

import type { ReactNode } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export interface OptionItem {
  value: string;
  label: string;
}

interface OptionSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: OptionItem[];
  placeholder?: string;
  className?: string;
  icon?: ReactNode;
  disabled?: boolean;
  invalid?: boolean;
}

/**
 * Select over API-loaded options (ids as values). Passes `items` so the
 * trigger shows the option label, not the raw id.
 */
export function OptionSelect({ value, onChange, options, placeholder, className, icon, disabled, invalid }: OptionSelectProps) {
  const items = Object.fromEntries(options.map((o) => [o.value, o.label]));
  return (
    <Select value={value || null} onValueChange={(v) => onChange(v ? String(v) : '')} items={items} disabled={disabled}>
      <SelectTrigger className={className} aria-invalid={invalid || undefined}>
        {icon}
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((o) => (
          <SelectItem key={o.value} value={o.value}>
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
