import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface StatCardProps {
  title: string;
  value: ReactNode;
  description?: string;
  trend?: { value: string; positive?: boolean };
  icon?: LucideIcon;
  className?: string;
}

export function StatCard({ title, value, description, trend, icon: Icon, className }: StatCardProps) {
  return (
    <Card className={cn('border-border/60', className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-muted-foreground text-sm font-medium">{title}</CardTitle>
        {Icon ? <Icon className="text-primary h-4 w-4" aria-hidden /> : null}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold tracking-tight">{value}</div>
        {description ? <p className="text-muted-foreground mt-1 text-xs">{description}</p> : null}
        {trend ? (
          <p
            className={cn(
              'mt-2 text-xs font-medium',
              trend.positive ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400',
            )}
          >
            {trend.value}
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}
