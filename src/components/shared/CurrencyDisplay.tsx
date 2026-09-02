import { cn } from '@/lib/utils';

interface CurrencyDisplayProps {
  amount: number;
  className?: string;
  showSymbol?: boolean;
}

export function formatBdt(amount: number): string {
  return new Intl.NumberFormat('en-BD', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function CurrencyDisplay({ amount, className, showSymbol = true }: CurrencyDisplayProps) {
  return (
    <span className={cn('font-mono tabular-nums', className)}>
      {showSymbol ? '৳' : ''}
      {formatBdt(amount)}
    </span>
  );
}
