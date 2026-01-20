import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, LoginCredentials, RegisterCredentials } from '../types';
import { authService, setRefreshToken } from '../services/auth';
import { setAccessToken } from '../services/api';
import { mockUser } from '../mocks';

// Check if we're in demo mode (no backend)
// Set to false to use real backend authentication
const DEMO_MODE = import.meta.env.VITE_DEMO_MODE === 'true';

// Helper to create demo user with computed name
const createDemoUser = (overrides: Partial<User> = {}): User => {
  const userData = { ...mockUser, ...overrides };
  return {
    ...userData,
    name: userData.full_name || userData.email.split('@')[0],
  };
};

interface AuthStore {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  logout: () => Promise<void>;
  fetchUser: () => Promise<void>;
  clearError: () => void;
  setUser: (user: User | null) => void;
  // Demo mode
  loginDemo: () => void;
  // Session restoration
  initializeAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (credentials) => {
        set({ isLoading: true, error: null });
        
        if (DEMO_MODE) {
          // Simulate API delay
          await new Promise((resolve) => setTimeout(resolve, 800));
          set({
            user: createDemoUser({ email: credentials.email }),
            isAuthenticated: true,
            isLoading: false,
          });
          return;
        }

        try {
          const response = await authService.login(credentials);
          set({
            user: response.user,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          const errorMessage =
            (error as { detail?: string })?.detail ||
            (error as Error).message ||
            'Login failed';
          set({
            isLoading: false,
            error: errorMessage,
          });
          throw error;
        }
      },

      register: async (credentials) => {
        set({ isLoading: true, error: null });
        
        if (DEMO_MODE) {
          // Simulate API delay
          await new Promise((resolve) => setTimeout(resolve, 1000));
          set({
            user: createDemoUser({
              full_name: credentials.name,
              email: credentials.email,
            }),
            isAuthenticated: true,
            isLoading: false,
          });
          return;
        }

        try {
          const response = await authService.register(credentials);
          set({
            user: response.user,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          const errorMessage =
            (error as { detail?: string })?.detail ||
            (error as Error).message ||
            'Registration failed';
          set({
            isLoading: false,
            error: errorMessage,
          });
          throw error;
        }
      },

      logout: async () => {
        set({ isLoading: true });
        
        if (DEMO_MODE) {
          await new Promise((resolve) => setTimeout(resolve, 300));
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });
          return;
        }

        try {
          await authService.logout();
        } finally {
          setAccessToken(null);
          setRefreshToken(null);
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });
        }
      },

      fetchUser: async () => {
        if (!get().isAuthenticated && !authService.hasStoredSession()) return;
        
        if (DEMO_MODE) {
          set({ user: createDemoUser(), isAuthenticated: true });
          return;
        }
        
        set({ isLoading: true });
        try {
          const user = await authService.getCurrentUser();
          set({ user, isAuthenticated: true, isLoading: false });
        } catch {
          // Token might be invalid, try to refresh
          try {
            const response = await authService.refreshToken();
            set({ user: response.user, isAuthenticated: true, isLoading: false });
          } catch {
            authService.clearSession();
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
          });
          }
        }
      },

      initializeAuth: async () => {
        // Check if we have stored tokens and try to restore session
        if (DEMO_MODE) {
          return;
        }

        const hasSession = authService.hasStoredSession();
        if (hasSession) {
          await get().fetchUser();
        }
      },

      clearError: () => set({ error: null }),
      
      setUser: (user) => set({ user, isAuthenticated: !!user }),

      loginDemo: () => {
        set({
          user: createDemoUser(),
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        user: state.user,
      }),
    }
  )
);
