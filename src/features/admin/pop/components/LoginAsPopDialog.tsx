'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { Loader2, LogIn } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { http } from '@/lib/api/client';
import { authService } from '@/lib/api/services/auth.service';
import { setAuthCookie } from '@/lib/auth/session-cookie';
import { parkImpersonatorSession } from '@/lib/auth/impersonation';
import { queryClient } from '@/lib/query-client';
import { useAuthStore } from '@/stores/auth-store';
import { useTranslations } from '@/i18n/locale-context';

interface ImpersonationResult {
  access_token: string;
  expires_in: number;
  name: string;
}

/**
 * "Login as POP" — POST /api/v1/pops/{id}/impersonate. The backend issues a
 * short-lived, audit-logged access token (no refresh token). The admin's own
 * session is parked in this tab so the shell can offer "Return".
 */
export function LoginAsPopDialog({ pop, onClose }: { pop: { id: string; name: string } | null; onClose: () => void }) {
  const router = useRouter();
  const t = useTranslations();
  const [password, setPassword] = useState('');

  const login = useMutation({
    mutationFn: async () => {
      const original = useAuthStore.getState();
      if (!original.user || !original.token) throw new Error(t('admin.pop.loginAs.notSignedIn', 'You are not signed in.'));
      const result = await http.post<ImpersonationResult>(`/v1/pops/${pop?.id}/impersonate`, password ? { password } : {});

      let refreshToken: string | null = null;
      try {
        refreshToken = localStorage.getItem('isp_refresh_token');
      } catch {
        /* storage unavailable */
      }
      parkImpersonatorSession({
        user: original.user,
        token: original.token,
        refreshToken,
        impersonatedName: result.name,
        returnTo: '/admin/pop/resellers',
      });

      // Switch the session, then load the POP's own profile + permissions.
      try {
        localStorage.removeItem('isp_refresh_token');
      } catch {
        /* ignore */
      }
      queryClient.clear();
      useAuthStore.setState({ token: result.access_token });
      const user = await authService.me();
      useAuthStore.setState({ user, isAuthenticated: true });
      setAuthCookie({ userId: user.id, role: user.role, status: user.status });
      return user;
    },
    onSuccess: (user) => {
      toast.success(t('admin.pop.loginAs.signedIn', 'Signed in as {name}', { name: user.name }));
      setPassword('');
      onClose();
      router.replace('/admin/dashboard');
    },
  });

  return (
    <Dialog open={!!pop} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('admin.pop.loginAs.title', 'Log in as {name}', { name: pop?.name ?? '' })}</DialogTitle>
          <DialogDescription>
            {t(
              'admin.pop.loginAs.desc',
              "You will act inside this POP's portal with a short-lived session. Every login is recorded in the audit log. Use “Return” in the banner to come back to your account.",
            )}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-1.5 py-2">
          <Label htmlFor="pop-imp-password">{t('admin.pop.loginAs.password', 'Your password')}</Label>
          <Input
            id="pop-imp-password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <p className="text-muted-foreground text-xs">
            {t('admin.pop.loginAs.passwordHint', "Confirms it's you. Optional unless your platform requires it.")}
          </p>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>
            {t('common.cancel', 'Cancel')}
          </Button>
          <Button onClick={() => login.mutate()} disabled={login.isPending}>
            {login.isPending ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : <LogIn className="mr-1.5 h-4 w-4" />}
            {t('admin.pop.loginAs.submit', 'Log in as POP')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
