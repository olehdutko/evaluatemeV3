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
    login({ email, password })
      .then(() => {
        window.location.href = '/technologies';
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Login failed');
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="border-b border-border pb-4 mb-6">
        <h2 className="font-display text-2xl font-bold text-text-primary">Log in</h2>
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
          autoComplete="current-password"
          className="input-field"
        />
      </label>

      {error && <ErrorMessage message={error} />}

      <button
        type="submit"
        disabled={isSubmitting}
        className="btn-primary w-full"
      >
        {isSubmitting ? 'Logging in…' : 'Log in'}
      </button>
    </form>
  );
}
