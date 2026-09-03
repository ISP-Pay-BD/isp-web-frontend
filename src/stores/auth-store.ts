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

import { customerPermissions } from '@/data/users/permissions.data';

const DEFAULT_MOCK_USER: User = {
  id: 'user_001',
  name: 'Rahim Uddin',
  email: 'customer@demo.isppaybd.com',
  phone: '01710000001',
  role: 'user',
  status: 'active',
  tenantId: 'tenant_demo',
  organizationName: 'Demo ISP Network',
  permissions: customerPermissions,
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: DEFAULT_MOCK_USER,
      token: 'mock-token-user-001',
      isAuthenticated: true,

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
