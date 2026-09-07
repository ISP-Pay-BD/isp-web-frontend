'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, UserRole } from '@/types/auth';
import { mockFetch } from '@/lib/mock-api/client';
import { clearAuthCookie, setAuthCookie } from '@/lib/auth/session-cookie';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  /** False until zustand persist rehydrates from localStorage */
  hasHydrated: boolean;
  setHasHydrated: (value: boolean) => void;
  login: (email: string, password: string) => Promise<User>;
  logout: () => void;
  syncSessionCookie: () => void;
  role: () => UserRole | null;
}

/**
 * Start logged-out. Never seed a customer mock user here — that caused the
 * admin sidebar to flash customer nav (Rahim Uddin) on every hard refresh
 * before persist rehydration finished.
 */
export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      hasHydrated: false,

      setHasHydrated: (value) => set({ hasHydrated: value }),

      login: async (email, password) => {
        const session = await mockFetch('auth.login', { email, password });
        set({
          user: session.user,
          token: session.token,
          isAuthenticated: true,
        });
        setAuthCookie({
          userId: session.user.id,
          role: session.user.role,
          status: session.user.status,
        });
        return session.user;
      },

      logout: () => {
        set({ user: null, token: null, isAuthenticated: false });
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
