'use client';

import React, { useState } from 'react';
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
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Sidebar container: width animates from 16rem (open) to 0 (closed) */}
      <aside
        className={`relative bg-text-primary text-inverted-primary border-r border-inverted-border flex-shrink-0 overflow-hidden transition-all duration-300 ease-in-out ${
          isOpen ? 'w-64 opacity-100' : 'w-0 opacity-0'
        }`}
        aria-hidden={!isOpen}
      >
        {/* Inner wrapper keeps the sidebar content at a fixed 16rem width so it doesn't squash */}
        <div className="w-64 min-h-screen flex flex-col">
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
          <div className="p-4 border-t border-inverted-border mt-auto">
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
        </div>
      </aside>

      {/* Toggle button anchored to the left edge of the main content */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label={isOpen ? 'Collapse admin menu' : 'Expand admin menu'}
        className="fixed top-4 left-0 z-50 flex items-center justify-center w-8 h-10 bg-text-primary text-inverted-primary border border-l-0 border-inverted-border rounded-r-md hover:bg-inverted-border transition-all duration-300"
        style={{ transform: isOpen ? 'translateX(16rem)' : 'translateX(0)' }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          className={`w-5 h-5 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M11.78 5.22a.75.75 0 0 1 0 1.06L8.06 10l3.72 3.72a.75.75 0 1 1-1.06 1.06l-4.25-4.25a.75.75 0 0 1 0-1.06l4.25-4.25a.75.75 0 0 1 1.06 0Z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      <main className="flex-1 min-w-0 transition-all duration-300">
        <div className={`transition-all duration-300 ${isOpen ? 'lg:pl-0' : ''}`}>{children}</div>
      </main>
    </div>
  );
}
