'use client';

interface ChartTooltipProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    color: string;
    dataKey: string;
  }>;
  label?: string;
  formatter?: (value: number, name: string) => string;
  labelFormatter?: (label: string) => string;
}

export function ChartTooltip({
  active,
  payload,
  label,
  formatter,
  labelFormatter,
}: ChartTooltipProps) {
  if (!active || !payload?.length) return null;

  return (
    <div
      className="rounded-xl border border-border/80 bg-card/95 backdrop-blur-xl shadow-2xl p-3 min-w-[160px]"
    >
      {label && (
        <p className="text-[11px] font-semibold text-muted-foreground mb-2 pb-2 border-b border-border/50">
          {labelFormatter ? labelFormatter(label) : label}
        </p>
      )}
      <div className="space-y-1.5">
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-2">
              <span
                className="h-2.5 w-2.5 rounded-full ring-2 ring-background shadow-sm"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-muted-foreground capitalize">
                {entry.name === 'collection' ? 'Collected' : entry.name}
              </span>
            </div>
            <span className="font-bold font-mono text-foreground tabular-nums">
              {formatter ? formatter(entry.value, entry.name) : entry.value.toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ChartTooltipWithBadge({
  active,
  payload,
  label,
  formatter,
  badge,
}: ChartTooltipProps & { badge?: { label: string; color: string } }) {
  if (!active || !payload?.length) return null;

  return (
    <div
      className="rounded-xl border border-border/80 bg-card/95 backdrop-blur-xl shadow-2xl p-3 min-w-[180px]"
    >
      <div className="flex items-center justify-between mb-2 pb-2 border-b border-border/50">
        <p className="text-[11px] font-semibold text-muted-foreground">
          {label}
        </p>
        {badge && (
          <span
            className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
            style={{ backgroundColor: `${badge.color}20`, color: badge.color }}
          >
            {badge.label}
          </span>
        )}
      </div>
      <div className="space-y-1.5">
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-2">
              <span
                className="h-2.5 w-2.5 rounded-full ring-2 ring-background shadow-sm"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-muted-foreground capitalize">
                {entry.dataKey === 'collection' ? 'Collected' : entry.dataKey}
              </span>
            </div>
            <span className="font-bold font-mono text-foreground tabular-nums">
              {formatter ? formatter(entry.value, entry.dataKey) : entry.value.toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
