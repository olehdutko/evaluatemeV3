'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { login, adminLogin, register, logout as apiLogout, getMe } from '../auth.api';
import type { RegisterRequest, LoginRequest, MeResponse } from '../schemas/auth';

type UserRole = 'user' | 'company' | 'admin';

export interface UserProfile {
  id: string;
  email: string;
  username: string | null;
  role: UserRole;
  credits: number;
}

interface AuthContextValue {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isCompany: boolean;
  isUser: boolean;
  isLoading: boolean;
  displayName: string;
  roleLabel: string;
  credits: number;
  login: (input: LoginRequest) => Promise<void>;
  adminLogin: (input: LoginRequest) => Promise<void>;
  register: (input: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function toUserProfile(data: MeResponse['data']): UserProfile {
  return {
    id: data.id,
    email: data.email,
    username: data.username,
    role: data.role,
    credits: data.credits,
  };
}

const ROLE_LABELS: Record<UserRole, string> = {
  user: 'Personal account',
  company: 'Company account',
  admin: 'Admin account',
};

export function AuthProvider({ children }: { children: React.ReactNode }): JSX.Element {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function restoreSession(): Promise<void> {
      try {
        const response = await getMe();
        if (!cancelled) {
          setUser(toUserProfile(response.data));
        }
      } catch (err) {
        if (!cancelled) {
          setUser(null);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void restoreSession();

    return () => {
      cancelled = true;
    };
  }, []);

  const refreshUser = useCallback(async (): Promise<UserProfile> => {
    const response = await getMe();
    const profile = toUserProfile(response.data);
    setUser(profile);
    return profile;
  }, []);

  const handleLogin = useCallback(
    async (input: LoginRequest) => {
      await login(input);
      await refreshUser();
    },
    [refreshUser],
  );

  const handleAdminLogin = useCallback(
    async (input: LoginRequest) => {
      await adminLogin(input);
      await refreshUser();
    },
    [refreshUser],
  );

  const handleRegister = useCallback(
    async (input: RegisterRequest) => {
      await register(input);
      await handleLogin({ email: input.email, password: input.password });
    },
    [handleLogin],
  );

  const handleLogout = useCallback(async () => {
    try {
      await apiLogout({ refreshToken: '' });
    } catch {
      // Ignore errors and clear client-side state anyway.
    }
    // Force-clear cookies in case backend logout did not clear them (e.g. invalid/expired tokens).
    if (typeof document !== 'undefined') {
      document.cookie = 'access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax';
      document.cookie = 'refresh_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax';
    }
    setUser(null);
    window.location.href = '/';
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: user !== null,
      isAdmin: user?.role === 'admin',
      isCompany: user?.role === 'company',
      isUser: user?.role === 'user',
      isLoading,
      displayName: user?.username ?? user?.email ?? '',
      roleLabel: user ? ROLE_LABELS[user.role] : '',
      credits: user?.credits ?? 0,
      login: handleLogin,
      adminLogin: handleAdminLogin,
      register: handleRegister,
      logout: handleLogout,
    }),
    [user, isLoading, handleLogin, handleAdminLogin, handleRegister, handleLogout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
