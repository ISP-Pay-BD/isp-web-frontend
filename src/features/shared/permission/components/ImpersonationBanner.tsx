'use client';

import { useState, useSyncExternalStore } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, UserRoundCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { http } from '@/lib/api/client';
import { setAuthCookie } from '@/lib/auth/session-cookie';
import { clearParkedSession, readParkedSession } from '@/lib/auth/impersonation';
import { queryClient } from '@/lib/query-client';
import { useAuthStore } from '@/stores/auth-store';

const subscribe = () => () => {};

/** Shown while an admin is acting as another account ("Log in as" a tenant admin or POP). */
export function ImpersonationBanner() {
  const router = useRouter();
  const parked = useSyncExternalStore(subscribe, readParkedSession, () => null);
  const [returning, setReturning] = useState(false);

  if (!parked) return null;

  const returnToSuperAdmin = async () => {
    setReturning(true);
    // Ends the server-side impersonation session (audit-logged). Best effort:
    // the local session is restored even if the short-lived token already expired.
    await http.post('/v1/auth/impersonation/end', {}).catch(() => undefined);
    try {
      if (parked.refreshToken) localStorage.setItem('isp_refresh_token', parked.refreshToken);
    } catch {
      /* ignore */
    }
    clearParkedSession();
    queryClient.clear();
    useAuthStore.setState({ user: parked.user, token: parked.token, isAuthenticated: true });
    setAuthCookie({ userId: parked.user.id, role: parked.user.role, status: parked.user.status });
    router.replace(parked.returnTo ?? '/platform/admins');
  };

  return (
    <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-2.5 text-sm">
      <span className="flex items-center gap-2 text-amber-700 dark:text-amber-300">
        <UserRoundCheck className="h-4 w-4" aria-hidden />
        You are signed in as <strong>{parked.impersonatedName}</strong> (“Log in as”).
      </span>
      <Button size="sm" variant="outline" onClick={returnToSuperAdmin} disabled={returning}>
        {returning ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : null}
        Return to my account
      </Button>
    </div>
  );
}
