'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../../lib/auth/auth-context';

const publicLinks = [
  { href: '/', label: 'Home' },
  { href: '/technologies', label: 'Technologies' },
  { href: '/health', label: 'Health' },
];

export function Header(): JSX.Element {
  const { isAuthenticated, isLoading, logout, displayName, roleLabel, credits } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  function closeMenu(): void {
    setMenuOpen(false);
    setUserMenuOpen(false);
  }

  return (
    <header className="sticky top-0 z-50 bg-bg-primary border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          <Link
            href="/"
            aria-label="EvaluateMe.IT home"
            className="flex items-baseline gap-1 font-display font-bold text-lg sm:text-xl text-text-primary"
            onClick={closeMenu}
          >
            <span className="sr-only">EvaluateMe.IT</span>
            <span aria-hidden="true">EvaluateMe</span>
            <span className="font-mono text-xs text-accent" aria-hidden="true">.IT</span>
          </Link>

          {/* Desktop nav */}
          <nav aria-label="Main navigation" className="hidden md:flex items-center gap-8">
            {publicLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="font-body text-text-secondary hover:text-text-primary underline-offset-4 decoration-1 hover:underline transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Desktop auth */}
          <div className="hidden md:flex items-center gap-4">
            {!isLoading &&
              (isAuthenticated ? (
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setUserMenuOpen((prev) => !prev)}
                    className="flex items-center gap-2 font-mono text-sm text-text-secondary hover:text-text-primary"
                    aria-expanded={userMenuOpen}
                    aria-haspopup="menu"
                  >
                    <span className="hidden lg:inline">{displayName}</span>
                    <span className="lg:hidden">Account</span>
                    <span aria-hidden="true">{userMenuOpen ? '▾' : '▸'}</span>
                  </button>
                  {userMenuOpen && (
                    <div
                      role="menu"
                      className="absolute right-0 top-full mt-2 w-56 bg-bg-primary border border-border-strong shadow-sm"
                    >
                      <div className="px-4 py-3 border-b border-border">
                        <p className="font-body text-sm text-text-primary truncate">{displayName}</p>
                        <p className="font-mono text-xs text-accent">{roleLabel}</p>
                        <p className="font-mono text-xs text-text-secondary mt-1">Credits: {credits}</p>
                      </div>
                      <Link
                        href="/profile"
                        className="block px-4 py-3 text-sm hover:bg-bg-secondary transition-colors"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        Profile
                      </Link>
                      <button
                        type="button"
                        onClick={() => {
                          setUserMenuOpen(false);
                          void logout();
                        }}
                        className="block w-full text-left px-4 py-3 text-sm hover:bg-bg-secondary transition-colors"
                      >
                        Log out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="font-mono text-sm uppercase tracking-wider text-text-secondary hover:text-text-primary"
                  >
                    Log in
                  </Link>
                  <Link href="/register" className="btn-primary text-sm py-2 px-4">
                    Sign up
                  </Link>
                </>
              ))}
          </div>

          {/* Mobile menu button */}
          <button
            type="button"
            onClick={() => setMenuOpen((prev) => !prev)}
            className="md:hidden p-2 -mr-2 text-text-primary"
            aria-expanded={menuOpen}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          >
            <span className="block w-6 h-0.5 bg-current mb-1.5 transition-transform" />
            <span className="block w-6 h-0.5 bg-current mb-1.5" />
            <span className="block w-6 h-0.5 bg-current" />
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-border bg-bg-primary">
          <nav aria-label="Mobile navigation" className="max-w-7xl mx-auto px-4 py-6 space-y-1">
            {publicLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={closeMenu}
                className="block py-3 font-display text-2xl text-text-primary border-b border-border last:border-0"
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-6 flex flex-col gap-3">
              {!isLoading &&
                (isAuthenticated ? (
                  <>
                    <div className="px-4 py-3 border-b border-border"
                    >
                      <p className="font-body text-lg text-text-primary">{displayName}</p>
                      <p className="font-mono text-sm text-accent">{roleLabel}</p>
                      <p className="font-mono text-sm text-text-secondary mt-1">Credits: {credits}</p>
                    </div>
                    <Link
                      href="/profile"
                      onClick={closeMenu}
                      className="btn-secondary text-center"
                    >
                      Profile
                    </Link>
                    <button
                      type="button"
                      onClick={() => {
                        closeMenu();
                        void logout();
                      }}
                      className="btn-secondary text-center"
                    >
                      Log out
                    </button>
                  </>
                ) : (
                  <>
                    <Link href="/login" onClick={closeMenu} className="btn-secondary text-center">
                      Log in
                    </Link>
                    <Link href="/register" onClick={closeMenu} className="btn-primary text-center">
                      Sign up
                    </Link>
                  </>
                ))}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
