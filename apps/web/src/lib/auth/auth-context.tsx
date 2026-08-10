'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { login, register, logout as apiLogout } from '../auth.api';
import { getTokens, saveTokens, clearTokens, isTokenExpired, AuthTokens } from './token-storage';
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
    const tokens = getTokens();
    setIsAuthenticated(!!tokens && !isTokenExpired(tokens));
    setIsLoading(false);
  }, []);

  const handleLogin = useCallback(async (input: LoginRequest) => {
    const response = await login(input);
    const tokens: AuthTokens = {
      accessToken: response.data.accessToken,
      refreshToken: response.data.refreshToken,
      expiresAt: Date.now() + response.data.expiresInSeconds * 1000,
    };
    saveTokens(tokens);
    setIsAuthenticated(true);
  }, []);

  const handleRegister = useCallback(async (input: RegisterRequest) => {
    await register(input);
    await handleLogin({ email: input.email, password: input.password });
  }, [handleLogin]);

  const handleLogout = useCallback(async () => {
    const tokens = getTokens();
    if (tokens) {
      try {
        await apiLogout({ refreshToken: tokens.refreshToken });
      } catch {
        // Ignore backend errors and clear local session anyway.
      }
    }
    clearTokens();
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
