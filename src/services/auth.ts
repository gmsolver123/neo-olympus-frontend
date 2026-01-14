import { ENDPOINTS } from '../config/api';
import type { AuthResponse, LoginCredentials, RegisterCredentials, User } from '../types';
import api, { apiGet, apiPost, setAccessToken } from './api';

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await apiPost<AuthResponse>(ENDPOINTS.AUTH.LOGIN, credentials);
    setAccessToken(response.access_token);
    return response;
  },

  async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    const response = await apiPost<AuthResponse>(ENDPOINTS.AUTH.REGISTER, credentials);
    setAccessToken(response.access_token);
    return response;
  },

  async logout(): Promise<void> {
    try {
      await apiPost(ENDPOINTS.AUTH.LOGOUT);
    } finally {
      setAccessToken(null);
    }
  },

  async getCurrentUser(): Promise<User> {
    return apiGet<User>(ENDPOINTS.AUTH.ME);
  },

  async refreshToken(): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>(ENDPOINTS.AUTH.REFRESH);
    setAccessToken(response.data.access_token);
    return response.data;
  },
};
