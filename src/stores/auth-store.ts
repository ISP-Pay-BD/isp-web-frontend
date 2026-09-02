'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, UserRole } from '@/types/auth';
import { mockFetch } from '@/lib/mock-api/client';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<User>;
  logout: () => void;
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
        return session.user;
      },

      logout: () => {
        set({ user: null, token: null, isAuthenticated: false });
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

export function getRoleHomePath(role: UserRole): string {
  switch (role) {
    case 'user':
      return '/customer/dashboard';
    case 'resellerAdmin':
    case 'admin':
      return '/admin/dashboard';
    case 'super_admin':
      return '/platform/dashboard';
    case 'employee':
      return '/employee/salaries';
    default:
      return '/login';
  }
}
