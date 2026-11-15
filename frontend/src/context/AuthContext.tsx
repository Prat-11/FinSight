import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, LoginCredentials, RegisterCredentials } from '../types';
import { authService } from '../services/authService';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  loginAsDemo: () => void;
  logout: () => void;
}

const DEFAULT_DEMO_USER: User = {
  id: 'usr_demo_1',
  name: 'Demo Investor',
  email: 'investor@finsight.io',
  createdAt: new Date().toISOString(),
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(DEFAULT_DEMO_USER);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('finsight_token') || 'demo-jwt-token');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('finsight_token');
      if (storedToken && storedToken !== 'demo-jwt-token') {
        try {
          const currentUser = await authService.getCurrentUser();
          if (currentUser) {
            setUser(currentUser);
            setToken(storedToken);
          } else {
            const savedUserStr = localStorage.getItem('finsight_user');
            if (savedUserStr) {
              setUser(JSON.parse(savedUserStr));
              setToken(storedToken);
            } else {
              setUser(DEFAULT_DEMO_USER);
              setToken('demo-jwt-token');
            }
          }
        } catch {
          const savedUserStr = localStorage.getItem('finsight_user');
          if (savedUserStr) {
            try {
              setUser(JSON.parse(savedUserStr));
              setToken(storedToken);
            } catch {
              setUser(DEFAULT_DEMO_USER);
              setToken('demo-jwt-token');
            }
          } else {
            setUser(DEFAULT_DEMO_USER);
            setToken('demo-jwt-token');
          }
        }
      } else {
        // Default to demo user if no explicit token is saved
        setUser(DEFAULT_DEMO_USER);
        setToken('demo-jwt-token');
      }
      setIsLoading(false);
    };

    initializeAuth();

    const handleUnauthorized = () => {
      // On 401, revert to demo session instead of breaking the app
      setUser(DEFAULT_DEMO_USER);
      setToken('demo-jwt-token');
    };

    window.addEventListener('finsight:unauthorized', handleUnauthorized);
    return () => {
      window.removeEventListener('finsight:unauthorized', handleUnauthorized);
    };
  }, []);

  const login = async (credentials: LoginCredentials) => {
    setIsLoading(true);
    try {
      const response = await authService.login(credentials);
      const authToken = response.token || response.access_token || 'demo-jwt-token';
      setToken(authToken);
      setUser(response.user);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (credentials: RegisterCredentials) => {
    setIsLoading(true);
    try {
      const response = await authService.register(credentials);
      const authToken = response.token || response.access_token || 'demo-jwt-token';
      setToken(authToken);
      setUser(response.user);
    } finally {
      setIsLoading(false);
    }
  };

  const loginAsDemo = () => {
    localStorage.setItem('finsight_token', 'demo-jwt-token');
    localStorage.setItem('finsight_user', JSON.stringify(DEFAULT_DEMO_USER));
    setUser(DEFAULT_DEMO_USER);
    setToken('demo-jwt-token');
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        isLoading,
        login,
        register,
        loginAsDemo,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
