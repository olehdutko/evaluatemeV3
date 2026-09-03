'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { forgotPassword } from '../../lib/auth.api';
import { ErrorMessage } from '../../components/ui/ErrorMessage';

export default function ForgotPasswordPage(): JSX.Element {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent): Promise<void> {
    event.preventDefault();
    setError(null);
    setSuccess(false);
    setIsSubmitting(true);

    try {
      await forgotPassword({ email: email.trim() });
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to request password reset');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-[calc(100vh-9rem)] flex flex-col lg:flex-row">
      <section className="flex items-end lg:items-center bg-bg-secondary border-b lg:border-b-0 lg:border-r border-border px-4 sm:px-6 lg:px-12 xl:px-16 py-12 lg:py-16 lg:w-1/2">
        <div className="max-w-md">
          <p className="font-mono text-sm uppercase tracking-[0.12em] text-accent mb-4">Security</p>
          <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-text-primary leading-tight">
            Reset your password.
          </h1>
          <p className="mt-4 text-text-secondary font-body">
            Enter your email and we&apos;ll send you a secure link to choose a new password.
          </p>
        </div>
      </section>

      <section className="flex items-start lg:items-center justify-center px-4 sm:px-6 lg:px-12 xl:px-16 py-12 lg:py-16 lg:w-1/2 bg-bg-primary">
        <div className="w-full max-w-md">
          <div className="panel p-6 sm:p-8 space-y-6">
            <form onSubmit={(event) => { void handleSubmit(event); }} className="space-y-5">
              <div className="border-b border-border pb-4 mb-6">
                <h2 className="font-display text-2xl font-bold text-text-primary">Forgot password</h2>
              </div>

              <label className="block">
                <span className="label-mono">Email</span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  className="input-field"
                  placeholder="you@example.com"
                />
              </label>

              {error && <ErrorMessage message={error} />}
              {success && (
                <div className="border-l-4 border-success bg-success/5 p-4" role="status">
                  <p className="font-mono text-xs uppercase tracking-wider text-success mb-1">Sent</p>
                  <p className="font-body text-text-primary">
                    If an account exists for this email, you will receive a reset link shortly.
                  </p>
                </div>
              )}

              <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
                {isSubmitting ? 'Sending…' : 'Send reset link'}
              </button>
            </form>
          </div>
          <p className="mt-6 text-center text-text-secondary font-body text-sm">
            Remember your password?{' '}
            <Link href="/login" className="text-accent hover:text-accent-hover underline underline-offset-4">
              Log in
            </Link>
          </p>
        </div>
      </section>
    </div>
  );
}
