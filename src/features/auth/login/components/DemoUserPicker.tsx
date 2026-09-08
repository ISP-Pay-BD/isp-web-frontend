'use client';

import { useQuery } from '@tanstack/react-query';
import { mockFetch } from '@/lib/mock-api/client';
import type { UserRole } from '@/types/auth';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const ROLE_LABELS: Record<UserRole, string> = {
  user: 'Customer',
  admin: 'Admin',
  resellerAdmin: 'Reseller',
  employee: 'Employee',
  super_admin: 'Super Admin',
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
    <div className="space-y-3">
      <p className="text-muted-foreground text-xs font-medium tracking-wide">Demo accounts</p>
      <div className="grid gap-2 sm:grid-cols-2">
        {demoUserCredentials.map((demo) => (
          <Button
            key={demo.email}
            type="button"
            variant="outline"
            size="sm"
            disabled={disabled}
            className="h-auto flex-col items-start gap-1 px-3 py-2 text-left"
            onClick={() => onSelect(demo.email, demo.password)}
          >
            <span className="flex w-full items-center justify-between gap-2">
              <span className="truncate text-sm font-medium">{demo.name}</span>
              <Badge variant="secondary" className="shrink-0 text-[10px]">
                {ROLE_LABELS[demo.role] ?? demo.role}
              </Badge>
            </span>
            <span className="truncate text-[11px] text-muted-foreground">{demo.email}</span>
          </Button>
        ))}
      </div>
    </div>
  );
}
