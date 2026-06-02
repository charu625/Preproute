import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AuthState } from '../types/store'

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      setAuth: (token, user) => set({ token, user }),
      logout: () => set({ token: null, user: null }),
      isAuthenticated: () => Boolean(get().token),
    }),
    {
      name: 'preproute-auth',
      partialize: (state) => ({ token: state.token, user: state.user }),
    },
  ),
)
