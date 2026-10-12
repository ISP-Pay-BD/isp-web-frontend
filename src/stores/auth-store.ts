'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, UserRole } from '@/types/auth';
import { clearAuthCookie, setAuthCookie } from '@/lib/auth/session-cookie';
import { registerAuthHandlers } from '@/lib/api/client';
import { queryClient } from '@/lib/query-client';

import { authService } from '@/lib/api/services/auth.service';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  /** False until zustand persist rehydrates from localStorage */
  hasHydrated: boolean;
  setHasHydrated: (value: boolean) => void;
  login: (email: string, password?: string, otp?: string) => Promise<User>;
  logout: () => void;
  syncSessionCookie: () => void;
  role: () => UserRole | null;
}

/**
 * Start logged-out. Never seed a user here — that caused the admin sidebar
 * to flash the wrong nav on every hard refresh before rehydration finished.
 */
export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      hasHydrated: false,

      setHasHydrated: (value) => set({ hasHydrated: value }),

      login: async (email, password = '', otp) => {
        const response = await authService.login({ email, password, ...(otp ? { otp } : {}) });
        // A previous account's cached lists must never leak into this session.
        queryClient.clear();
        set({
          user: response.user,
          token: response.token,
          isAuthenticated: true,
        });
        setAuthCookie({
          userId: response.user.id,
          role: response.user.role,
          status: response.user.status,
        });
        return response.user;
      },

      logout: () => {
        authService.logout().catch(() => {});
        set({ user: null, token: null, isAuthenticated: false });
        queryClient.clear();
        clearAuthCookie();
      },

      syncSessionCookie: () => {
        const user = get().user;
        if (user) {
          setAuthCookie({
            userId: user.id,
            role: user.role,
            status: user.status,
          });
        } else {
          clearAuthCookie();
        }
      },

      role: () => get().user?.role ?? null,
    }),
    {
      name: 'isp-auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state, error) => {
        if (error) {
          console.error('Auth rehydration failed', error);
        }
        // state has setHasHydrated — use it directly instead of referencing
        // the module-level useAuthStore which isn't assigned yet at this point.
        state?.setHasHydrated(true);
        state?.syncSessionCookie();
      },
    },
  ),
);

// The HTTP client refreshes tokens and detects dead sessions; keep the store in sync.
registerAuthHandlers({
  onTokenRefreshed: (token) => useAuthStore.setState({ token }),
  onSessionExpired: () => {
    useAuthStore.getState().logout();
    if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
      window.location.assign('/login?expired=1');
    }
  },
});
