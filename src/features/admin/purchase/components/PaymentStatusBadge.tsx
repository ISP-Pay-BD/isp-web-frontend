import { Badge } from '@/components/ui/badge';

/** Purchase-bill payment status: paid | partial | unpaid. */
export function PaymentStatusBadge({ status }: { status: string }) {
  if (status === 'paid') {
    return (
      <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/30">
        Paid in Full
      </Badge>
    );
  }
  if (status === 'partial') {
    return (
      <Badge variant="outline" className="bg-amber-500/10 text-amber-500 border-amber-500/30">
        Partially Paid
      </Badge>
    );
  }
  return (
    <Badge variant="outline" className="bg-rose-500/10 text-rose-500 border-rose-500/30">
      Unpaid / Due
    </Badge>
  );
}
