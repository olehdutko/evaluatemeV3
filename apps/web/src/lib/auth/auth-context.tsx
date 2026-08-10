'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { login, register, logout as apiLogout } from '../auth.api';
import type { RegisterRequest, LoginRequest } from '../schemas/auth';

interface AuthContextValue {
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (input: LoginRequest) => Promise<void>;
  register: (input: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }): JSX.Element {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Server-side rendering cannot read cookies; default to not authenticated.
    // Middleware handles server-side protection.
    setIsAuthenticated(false);
    setIsLoading(false);
  }, []);

  const handleLogin = useCallback(async (input: LoginRequest) => {
    await login(input);
    setIsAuthenticated(true);
  }, []);

  const handleRegister = useCallback(async (input: RegisterRequest) => {
    await register(input);
    await handleLogin({ email: input.email, password: input.password });
  }, [handleLogin]);

  const handleLogout = useCallback(async () => {
    try {
      await apiLogout({ refreshToken: '' });
    } catch {
      // Ignore errors and clear client-side state anyway.
    }
    setIsAuthenticated(false);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isLoading,
        login: handleLogin,
        register: handleRegister,
        logout: handleLogout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
