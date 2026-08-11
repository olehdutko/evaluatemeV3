'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { login, adminLogin, register, logout as apiLogout } from '../auth.api';
import type { RegisterRequest, LoginRequest } from '../schemas/auth';

interface AuthContextValue {
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  login: (input: LoginRequest) => Promise<void>;
  adminLogin: (input: LoginRequest) => Promise<void>;
  register: (input: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }): JSX.Element {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Server-side rendering cannot read cookies; default to not authenticated.
    // Middleware handles server-side protection.
    setIsAuthenticated(false);
    setIsAdmin(false);
    setIsLoading(false);
  }, []);

  const handleLogin = useCallback(async (input: LoginRequest) => {
    await login(input);
    setIsAuthenticated(true);
    setIsAdmin(false);
  }, []);

  const handleAdminLogin = useCallback(async (input: LoginRequest) => {
    await adminLogin(input);
    setIsAuthenticated(true);
    setIsAdmin(true);
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
    setIsAdmin(false);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isAdmin,
        isLoading,
        login: handleLogin,
        adminLogin: handleAdminLogin,
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
