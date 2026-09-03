'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { login, adminLogin, register, getMe } from '../auth.api';
import { setLogoutInProgress } from '../api-client';
import type { RegisterRequest, LoginRequest, MeResponse } from '../schemas/auth';

type UserRole = 'user' | 'company' | 'admin';

export interface UserProfile {
  id: string;
  email: string;
  username: string | null;
  role: UserRole;
  credits: number;
  firstName: string | null;
  lastName: string | null;
  middleName: string | null;
  birthDate: string | null;
  country: string | null;
  city: string | null;
  phone: string | null;
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
  refreshUser: () => Promise<UserProfile>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function toUserProfile(data: MeResponse['data']): UserProfile {
  return {
    id: data.id,
    email: data.email,
    username: data.username,
    role: data.role,
    credits: data.credits,
    firstName: data.firstName ?? null,
    lastName: data.lastName ?? null,
    middleName: data.middleName ?? null,
    birthDate: data.birthDate ?? null,
    country: data.country ?? null,
    city: data.city ?? null,
    phone: data.phone ?? null,
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
      // If we just logged out, do not attempt to restore the session. The cookies
      // may still be clearing and an automatic refresh-on-401 would re-create the
      // session before the reload finishes.
      const isPostLogout = typeof window !== 'undefined' && window.location.search.includes('logged-out=1');
      if (isPostLogout) {
        if (!cancelled) {
          setUser(null);
          setIsLoading(false);
        }
        return;
      }

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
      // refreshUser already runs inside handleLogin, so the new profile fields are loaded.
    },
    [handleLogin],
  );

  const clearAuthCookies = useCallback(() => {
    if (typeof document === 'undefined') return;
    const hostname = window.location.hostname;
    const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1';
    const domains = isLocalhost ? [''] : ['', hostname, `.${hostname}`];
    const paths = ['/', '/api'];
    const secureSuffix = window.location.protocol === 'https:' ? '; Secure' : '';
    const expires = 'expires=Thu, 01 Jan 1970 00:00:00 GMT';
    for (const name of ['access_token', 'refresh_token']) {
      for (const path of paths) {
        for (const domain of domains) {
          const domainPart = domain ? `; domain=${domain}` : '';
          document.cookie = `${name}=; path=${path}; ${expires}${domainPart}; SameSite=Lax${secureSuffix}`;
        }
      }
    }
  }, []);

  const handleLogout = useCallback(async () => {
    setLogoutInProgress(true);
    setUser(null);
    try {
      // Use a plain fetch here instead of apiLogout/fetchWithAuth so that an automatic
      // refresh-on-401 cannot recreate the session before the logout completes.
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';
      await fetch(`${API_BASE_URL}/api/v1/auth/logout`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken: '' }),
      });
    } catch {
      // Ignore errors and clear client-side state anyway.
    }
    clearAuthCookies();
    // Give the browser time to apply the Set-Cookie clear headers from the logout
    // response before the reload reads cookie state. Then force a full page reload so
    // the server sees cleared cookies. Use replace() to prevent the back button from
    // returning to the authenticated state. The logged-out=1 flag tells AuthProvider to
    // skip its automatic session restore and avoid a race-condition refresh.
    setTimeout(() => {
      window.location.replace('/?logged-out=1');
    }, 400);
  }, [clearAuthCookies]);

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
      refreshUser,
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
