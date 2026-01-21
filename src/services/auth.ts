import { ENDPOINTS } from '../config/api';
import type { AuthResponse, LoginCredentials, RegisterCredentials, User, RawUser } from '../types';
import api, { apiGet, setAccessToken, getAccessToken } from './api';

// Storage keys
const REFRESH_TOKEN_KEY = 'refresh_token';

export const getRefreshToken = (): string | null => {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
};

export const setRefreshToken = (token: string | null) => {
  if (token) {
    localStorage.setItem(REFRESH_TOKEN_KEY, token);
  } else {
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  }
};

// Transform backend user response to frontend User type
const transformUser = (userData: RawUser): User => {
  return {
    ...userData,
    name: userData.full_name || userData.email.split('@')[0],
  };
};

// API response types (raw from backend)
interface RawAuthResponse {
  user: RawUser;
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    // OAuth2 requires form data, not JSON
    const formData = new URLSearchParams();
    formData.append('username', credentials.email);
    formData.append('password', credentials.password);

    const response = await api.post<RawAuthResponse>(ENDPOINTS.AUTH.LOGIN, formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    const rawResponse = response.data;
    setAccessToken(rawResponse.access_token);
    setRefreshToken(rawResponse.refresh_token);

    return {
      ...rawResponse,
      user: transformUser(rawResponse.user),
    };
  },

  async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    // Register uses JSON body with full_name
    const response = await api.post<RawAuthResponse>(ENDPOINTS.AUTH.REGISTER, {
      email: credentials.email,
      password: credentials.password,
      full_name: credentials.name,
    });

    const rawResponse = response.data;
    setAccessToken(rawResponse.access_token);
    setRefreshToken(rawResponse.refresh_token);

    return {
      ...rawResponse,
      user: transformUser(rawResponse.user),
    };
  },

  async logout(): Promise<void> {
    const refreshToken = getRefreshToken();
    try {
      if (refreshToken) {
        await api.post(ENDPOINTS.AUTH.LOGOUT, { refresh_token: refreshToken });
      }
    } finally {
      setAccessToken(null);
      setRefreshToken(null);
    }
  },

  async getCurrentUser(): Promise<User> {
    const userData = await apiGet<RawUser>(ENDPOINTS.AUTH.ME);
    return transformUser(userData);
  },

  async refreshToken(): Promise<AuthResponse> {
    const currentRefreshToken = getRefreshToken();
    if (!currentRefreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await api.post<RawAuthResponse>(ENDPOINTS.AUTH.REFRESH, {
      refresh_token: currentRefreshToken,
    });

    const rawResponse = response.data;
    setAccessToken(rawResponse.access_token);
    setRefreshToken(rawResponse.refresh_token);

    return {
      ...rawResponse,
      user: transformUser(rawResponse.user),
    };
  },

  // Check if we have stored tokens (for session restoration)
  hasStoredSession(): boolean {
    return !!(getAccessToken() && getRefreshToken());
  },

  // Clear all stored auth data
  clearSession(): void {
    setAccessToken(null);
    setRefreshToken(null);
  },
};
