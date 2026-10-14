import { create } from 'zustand';
import { UserPayload, Tokens } from '@lifeos/shared-types';

interface AuthState {
  user: UserPayload | null;
  tokens: Tokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setAuth: (user: UserPayload, tokens: Tokens) => void;
  updateUser: (user: Partial<UserPayload>) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  tokens: null,
  isAuthenticated: false,
  isLoading: false,

  setAuth: (user, tokens) =>
    set({
      user,
      tokens,
      isAuthenticated: true,
      isLoading: false,
    }),

  updateUser: (updatedFields) =>
    set((state) => ({
      user: state.user ? { ...state.user, ...updatedFields } : null,
    })),

  logout: () =>
    set({
      user: null,
      tokens: null,
      isAuthenticated: false,
      isLoading: false,
    }),

  setLoading: (isLoading) => set({ isLoading }),
}));
