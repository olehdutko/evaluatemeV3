'use client';

import React, { useState } from 'react';
import { useAuth } from '../../lib/auth/auth-context';
import { ErrorMessage } from '../ui/ErrorMessage';

export function LoginForm(): JSX.Element {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);
    login({ email: email.trim(), password: password.trim() })
      .then(() => {
        window.location.href = '/technologies';
      })
      .catch((err) => {
        const message = err instanceof Error ? err.message : 'Login failed';
        // eslint-disable-next-line no-console
        console.error('Login error:', message);
        setError(message.includes('401') || message.includes('Unauthorized') || message.includes('No account') || message.includes('Incorrect password') ? 'Incorrect email or password.' : message);
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="pb-2">
        <h2 className="font-display text-2xl font-bold text-text-primary">Log in</h2>
      </div>

      <div className="space-y-5">
        <label className="block">
          <span className="label-mono">Email</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="off"
            className="input-field"
            placeholder="you@example.com"
          />
        </label>

        <label className="block">
          <span className="label-mono">Password</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
            autoComplete="off"
            className="input-field"
            placeholder="Enter your password"
          />
        </label>
      </div>

      {error && (
        <>
          <ErrorMessage message={error} />
          <p className="text-error font-body">{error}</p>
        </>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="btn-primary w-full mt-2"
      >
        {isSubmitting ? 'Logging in…' : 'Log in'}
      </button>
    </form>
  );
}
