'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, UserRole } from '@/types/auth';
import { mockFetch } from '@/lib/mock-api/client';
import { clearAuthCookie, setAuthCookie } from '@/lib/auth/session-cookie';
import { ROLE_HOME } from '@/lib/auth/route-access';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<User>;
  logout: () => void;
  syncSessionCookie: () => void;
  role: () => UserRole | null;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,

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
    },
  ),
);

/** @deprecated Use ROLE_HOME from @/lib/auth/route-access */
export function getRoleHomePath(role: UserRole): string {
  return ROLE_HOME[role] ?? '/login';
}
