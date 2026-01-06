/**
 * Authentication Context - Simplified
 * Manages user authentication state using real backend API
 */

import React, { createContext, useCallback, useState, useEffect, ReactNode } from 'react';
import { apiClient } from '../utils/apiClient';

export interface User {
  id: string;
  email: string;
  username: string;
  firstName?: string;
  lastName?: string;
  profilePicture?: string;
  bio?: string;
  preferences?: {
    theme: 'midnight' | 'nebula' | 'arctic' | 'sunset' | 'ocean' | 'forest';
    language: string;
    qualityPreference: 'low' | 'medium' | 'high' | 'lossless';
    autoPlaySimilar: boolean;
    privateMode: boolean;
    notificationsEnabled: boolean;
  };
  createdAt?: string;
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Authentication
  register: (email: string, username: string, password: string, firstName?: string, lastName?: string, otp?: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;

  // User
  updateProfile: (data: Partial<User>) => Promise<void>;

  // Utils
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(apiClient.isAuthenticated());

  // Initialize auth on mount
  useEffect(() => {
    const initAuth = async () => {
      if (apiClient.isAuthenticated()) {
        try {
          const response = await apiClient.getCurrentUser();
          if (response.success && response.data) {
            setUser(response.data);
            setIsAuthenticated(true);
          }
        } catch (err) {
          console.error('Failed to fetch user:', err);
          apiClient.logout();
          setIsAuthenticated(false);
        }
      }
    };

    initAuth();
  }, []);

  const register = useCallback(
    async (email: string, username: string, password: string, firstName?: string, lastName?: string, otp?: string) => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await apiClient.register(email, username, password, firstName, lastName, otp);

        if (!response.success) {
          throw new Error(response.message || 'Registration failed');
        }

        setUser(response.data?.user);
        setIsAuthenticated(true);
      } catch (err: any) {
        const message = err.message || 'Registration failed';
        setError(message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const login = useCallback(async (email: string, password: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await apiClient.login(email, password);

      if (!response.success) {
        throw new Error(response.message || 'Login failed');
      }

      setUser(response.data?.user);
      setIsAuthenticated(true);
    } catch (err: any) {
      const message = err.message || 'Login failed';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    apiClient.logout();
    setUser(null);
    setIsAuthenticated(false);
    setError(null);
  }, []);

  const updateProfile = useCallback(async (data: Partial<User>) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await apiClient.updateProfile(data);

      if (!response.success) {
        throw new Error(response.message || 'Update failed');
      }

      setUser(response.data);
    } catch (err: any) {
      const message = err.message || 'Update failed';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    error,
    register,
    login,
    logout,
    updateProfile,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = React.useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
