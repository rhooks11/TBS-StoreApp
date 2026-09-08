import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { tokenManager } from '@/lib/api/client';

export interface StoreUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

interface AuthState {
  user: StoreUser | null;
  isAuthenticated: boolean;
  login: (user: StoreUser, accessToken: string, refreshToken: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,

      login: (user, accessToken, refreshToken) => {
        tokenManager.setTokens(accessToken, refreshToken);
        tokenManager.setUser(user);
        set({ user, isAuthenticated: true });
      },

      logout: () => {
        tokenManager.clearAll();
        set({ user: null, isAuthenticated: false });
      },
    }),
    { name: 'tbs-store-auth' },
  ),
);
