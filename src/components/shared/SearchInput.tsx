'use client';

import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useTranslations } from '@/i18n/locale-context';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  'aria-label'?: string;
}

export function SearchInput({
  value,
  onChange,
  placeholder,
  className,
  'aria-label': ariaLabel,
}: SearchInputProps) {
  const t = useTranslations();
  return (
    <div className={cn('relative', className)}>
      <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder ?? t('common.table.searchPlaceholder', 'Search...')}
        aria-label={ariaLabel ?? t('common.search', 'Search')}
        className="focus-visible:border-primary/40 h-9 pl-9"
      />
    </div>
  );
}
