'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { resetPassword } from '../../lib/auth.api';
import { ErrorMessage } from '../../components/ui/ErrorMessage';
import { validatePasswordQuality, passwordScoreLabel } from '../../lib/schemas/password';

function PasswordStrength({ password }: { password: string }): JSX.Element | null {
  if (!password) return null;
  const { score, errors } = validatePasswordQuality(password);
  const { label, colorClass } = passwordScoreLabel(score);

  return (
    <div className="mt-3 space-y-2">
      <div className="flex items-center gap-2">
        <div className="flex-1 h-1.5 bg-bg-tertiary overflow-hidden">
          <div
            className={`h-full ${colorClass} transition-all duration-200`}
            style={{ width: `${(score / 5) * 100}%` }}
          />
        </div>
        <span className="font-mono text-xs text-text-secondary">{label}</span>
      </div>
      {errors.length > 0 && (
        <ul className="space-y-1">
          {errors.map((error) => (
            <li key={error} className="font-mono text-xs text-error">
              {error}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function ResetPasswordForm(): JSX.Element {
  const searchParams = useSearchParams();
  const token = searchParams.get('token') ?? '';

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent): Promise<void> {
    event.preventDefault();
    setError(null);
    setSuccess(false);

    if (!token) {
      setError('Invalid or missing reset token.');
      return;
    }

    const quality = validatePasswordQuality(newPassword);
    if (!quality.valid) {
      setError(quality.errors.join('. '));
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Password and confirmation do not match.');
      return;
    }

    setIsSubmitting(true);
    try {
      await resetPassword({ token, newPassword, confirmPassword });
      setSuccess(true);
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reset password');
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
            Choose a new password.
          </h1>
          <p className="mt-4 text-text-secondary font-body">
            Enter a strong new password below to regain access to your account.
          </p>
        </div>
      </section>

      <section className="flex items-start lg:items-center justify-center px-4 sm:px-6 lg:px-12 xl:px-16 py-12 lg:py-16 lg:w-1/2 bg-bg-primary">
        <div className="w-full max-w-md">
          <div className="panel p-6 sm:p-8 space-y-6">
            <form onSubmit={(event) => { void handleSubmit(event); }} className="space-y-5">
              <div className="border-b border-border pb-4 mb-6">
                <h2 className="font-display text-2xl font-bold text-text-primary">Reset password</h2>
              </div>

              <label className="block">
                <span className="label-mono">New password</span>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={12}
                  autoComplete="new-password"
                  className="input-field"
                  placeholder="Enter a strong new password"
                />
                <PasswordStrength password={newPassword} />
              </label>

              <label className="block">
                <span className="label-mono">Confirm new password</span>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={12}
                  autoComplete="new-password"
                  className="input-field"
                  placeholder="Re-enter your new password"
                />
              </label>

              {error && <ErrorMessage message={error} />}
              {success && (
                <div className="border-l-4 border-success bg-success/5 p-4" role="status">
                  <p className="font-mono text-xs uppercase tracking-wider text-success mb-1">Saved</p>
                  <p className="font-body text-text-primary">
                    Your password has been reset.{' '}
                    <Link href="/login" className="text-accent hover:text-accent-hover underline underline-offset-4">
                      Log in
                    </Link>
                  </p>
                </div>
              )}

              <button type="submit" disabled={isSubmitting || !token} className="btn-primary w-full">
                {isSubmitting ? 'Saving…' : 'Save new password'}
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}

export default function ResetPasswordPage(): JSX.Element {
  return (
    <Suspense fallback={
      <div className="min-h-[calc(100vh-9rem)] flex items-center justify-center">
        <p className="font-mono text-sm text-text-secondary">Loading…</p>
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
}
