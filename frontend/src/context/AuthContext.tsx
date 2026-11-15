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
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('finsight_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('finsight_token');
      if (storedToken) {
        setToken(storedToken);
        try {
          const currentUser = await authService.getCurrentUser();
          if (currentUser) {
            setUser(currentUser);
          } else {
            // If token existed but no user, create a fallback demo user or retain stored user
            const savedUserStr = localStorage.getItem('finsight_user');
            if (savedUserStr) {
              setUser(JSON.parse(savedUserStr));
            } else {
              setUser({
                id: 'usr_demo_1',
                name: 'Investor',
                email: 'demo@finsight.io',
                createdAt: new Date().toISOString(),
              });
            }
          }
        } catch {
          // Token might be expired or invalid
          const savedUserStr = localStorage.getItem('finsight_user');
          if (savedUserStr) {
            try {
              setUser(JSON.parse(savedUserStr));
            } catch {
              setUser(null);
            }
          }
        }
      }
      setIsLoading(false);
    };

    initializeAuth();

    // Listen for unauthorized events dispatched by API interceptor
    const handleUnauthorized = () => {
      setUser(null);
      setToken(null);
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
      const authToken = response.token || response.access_token || 'demo-token';
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
      const authToken = response.token || response.access_token || 'demo-token';
      setToken(authToken);
      setUser(response.user);
    } finally {
      setIsLoading(false);
    }
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
