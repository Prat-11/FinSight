import apiClient from './api';
import { AuthResponse, LoginCredentials, RegisterCredentials, User } from '../types';

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<AuthResponse>('/auth/login', credentials);
      const data = response.data;
      const token = data.token || data.access_token;
      if (token) {
        localStorage.setItem('finsight_token', token);
      }
      if (data.user) {
        localStorage.setItem('finsight_user', JSON.stringify(data.user));
      }
      return data;
    } catch (error: any) {
      // If server is completely offline / unreachable, provide local fallback session for testing
      if (!error.response) {
        const demoUser: User = {
          id: 'demo-user-1',
          name: credentials.email.split('@')[0] || 'Demo Investor',
          email: credentials.email,
          createdAt: new Date().toISOString(),
        };
        const demoToken = 'demo-jwt-token-' + Date.now();
        localStorage.setItem('finsight_token', demoToken);
        localStorage.setItem('finsight_user', JSON.stringify(demoUser));
        return {
          user: demoUser,
          token: demoToken,
        };
      }
      const message = error.response?.data?.detail || error.response?.data?.message || 'Login failed. Please check your credentials.';
      throw new Error(message);
    }
  },

  async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<AuthResponse>('/auth/register', credentials);
      const data = response.data;
      const token = data.token || data.access_token;
      if (token) {
        localStorage.setItem('finsight_token', token);
      }
      if (data.user) {
        localStorage.setItem('finsight_user', JSON.stringify(data.user));
      }
      return data;
    } catch (error: any) {
      if (!error.response) {
        const demoUser: User = {
          id: 'demo-user-' + Date.now(),
          name: credentials.name,
          email: credentials.email,
          createdAt: new Date().toISOString(),
        };
        const demoToken = 'demo-jwt-token-' + Date.now();
        localStorage.setItem('finsight_token', demoToken);
        localStorage.setItem('finsight_user', JSON.stringify(demoUser));
        return {
          user: demoUser,
          token: demoToken,
        };
      }
      const message = error.response?.data?.detail || error.response?.data?.message || 'Registration failed. Please try again.';
      throw new Error(message);
    }
  },

  async getCurrentUser(): Promise<User | null> {
    const token = localStorage.getItem('finsight_token');
    if (!token) return null;

    try {
      const response = await apiClient.get<User>('/auth/me');
      localStorage.setItem('finsight_user', JSON.stringify(response.data));
      return response.data;
    } catch (error) {
      const stored = localStorage.getItem('finsight_user');
      if (stored) {
        try {
          return JSON.parse(stored) as User;
        } catch {
          return null;
        }
      }
      return null;
    }
  },

  logout(): void {
    localStorage.removeItem('finsight_token');
    localStorage.removeItem('finsight_user');
  },
};
