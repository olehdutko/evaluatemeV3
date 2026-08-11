'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../../lib/auth/auth-context';

const navLinks = [
  { href: '/admin/dashboard', label: 'Dashboard' },
  { href: '/admin/pricing', label: 'Pricing' },
  { href: '/admin/email-templates', label: 'Email Templates' },
  { href: '/admin/landing-ads', label: 'Landing Ads' },
  { href: '/admin/users', label: 'Users' },
  { href: '/admin/technologies', label: 'Technologies' },
  { href: '/admin/questions', label: 'Questions' },
];

export function AdminLayoutShell({ children }: { children: React.ReactNode }): JSX.Element {
  const { logout, isAdmin } = useAuth();
  const pathname = usePathname();

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <aside className="lg:w-64 bg-text-primary text-inverted-primary border-r border-inverted-border flex-shrink-0">
        <div className="p-6 border-b border-inverted-border">
          <Link href="/admin/dashboard" className="font-display font-bold text-lg">
            EvaluateMe<span className="font-mono text-xs text-inverted-accent">.IT</span>
          </Link>
          <p className="font-mono text-xs text-inverted-secondary mt-1">Administration</p>
        </div>
        <nav className="p-4 space-y-1" aria-label="Admin navigation">
          {navLinks.map((link) => {
            const active = pathname === link.href || pathname.startsWith(`${link.href}/`);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`block px-4 py-3 font-mono text-sm transition-colors ${
                  active
                    ? 'bg-inverted-accent text-text-primary'
                    : 'text-inverted-secondary hover:bg-inverted-border hover:text-inverted-primary'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-inverted-border lg:mt-auto">
          {!isAdmin && (
            <p className="font-mono text-xs text-error mb-2">
              Warning: admin role not detected in this session.
            </p>
          )}
          <button
            type="button"
            onClick={() => void logout()}
            className="w-full text-left px-4 py-3 font-mono text-sm text-inverted-secondary hover:bg-inverted-border hover:text-inverted-primary transition-colors"
          >
            Log out
          </button>
        </div>
      </aside>
      <main className="flex-1 min-w-0">{children}</main>
    </div>
  );
}
