'use client';

import { useQuery } from '@tanstack/react-query';
import { mockFetch } from '@/lib/mock-api/client';
import type { UserRole } from '@/types/auth';
import { Badge } from '@/components/ui/badge';
import { UserCheck } from 'lucide-react';

const ROLE_CONFIG: Record<UserRole, { label: string; badgeClass: string }> = {
  user: { label: 'Customer', badgeClass: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' },
  admin: { label: 'Admin', badgeClass: 'bg-landing-cta/10 text-landing-cta border-landing-cta/20' },
  resellerAdmin: { label: 'Reseller', badgeClass: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
  employee: { label: 'Employee', badgeClass: 'bg-purple-500/10 text-purple-400 border-purple-500/20' },
  super_admin: { label: 'Super Admin', badgeClass: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
};

interface DemoUserPickerProps {
  onSelect: (email: string, password: string) => void;
  disabled?: boolean;
}

export function DemoUserPicker({ onSelect, disabled }: DemoUserPickerProps) {
  const { data: demoUserCredentials = [] } = useQuery({
    queryKey: ['auth', 'demoCredentials'],
    queryFn: () => mockFetch('auth.demoCredentials'),
  });

  return (
    <div className="space-y-3 pt-2">
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          <UserCheck className="h-3.5 w-3.5 text-primary" />
          Quick Demo Accounts
        </span>
        <span className="text-[11px] text-muted-foreground/60 font-mono">1-click fill</span>
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        {demoUserCredentials.map((demo) => {
          const roleConfig = ROLE_CONFIG[demo.role] ?? { label: demo.role, badgeClass: '' };
          return (
            <button
              key={demo.email}
              type="button"
              disabled={disabled}
              onClick={() => onSelect(demo.email, demo.password)}
              className="group flex flex-col justify-between rounded-xl border border-border/70 bg-card/60 p-2.5 text-left transition-all duration-200 hover:border-primary/40 hover:bg-accent/40 hover:shadow-xs active:scale-[0.99] disabled:opacity-50"
            >
              <div className="flex w-full items-center justify-between gap-1.5">
                <span className="truncate text-xs font-semibold text-foreground group-hover:text-primary transition-colors">
                  {demo.name}
                </span>
                <Badge
                  variant="outline"
                  className={`shrink-0 text-[10px] px-1.5 py-0 font-medium ${roleConfig.badgeClass}`}
                >
                  {roleConfig.label}
                </Badge>
              </div>
              <span className="truncate font-mono text-[11px] text-muted-foreground mt-1">
                {demo.email}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
