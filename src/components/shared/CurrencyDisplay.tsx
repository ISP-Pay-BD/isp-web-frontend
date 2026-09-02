import { cn } from '@/lib/utils';
import { formatBdt, CURRENCY_SYMBOL } from '@/lib/format';

interface CurrencyDisplayProps {
  amount: number;
  className?: string;
  showSymbol?: boolean;
}

export { formatBdt } from '@/lib/format';

export function CurrencyDisplay({ amount, className, showSymbol = true }: CurrencyDisplayProps) {
  return (
    <span className={cn('font-mono tabular-nums', className)}>
      {showSymbol ? CURRENCY_SYMBOL : ''}
      {formatBdt(amount)}
    </span>
  );
}
