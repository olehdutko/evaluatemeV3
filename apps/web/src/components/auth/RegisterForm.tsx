'use client';

import React, { useState } from 'react';
import { useAuth } from '../../lib/auth/auth-context';
import { ErrorMessage } from '../ui/ErrorMessage';

export function RegisterForm(): JSX.Element {
  const { register } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'user' | 'company' | 'admin'>('user');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);
    register({ email, password, role })
      .then(() => {
        window.location.href = '/technologies';
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Registration failed');
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="border-b border-border pb-4 mb-6">
        <h2 className="font-display text-2xl font-bold text-text-primary">Create account</h2>
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
          autoComplete="new-password"
          className="input-field"
        />
      </label>

      <label className="block">
        <span className="label-mono">Account type</span>
        <select
          value={role}
          onChange={(e) => setRole(e.target.value as 'user' | 'company' | 'admin')}
          className="input-field"
        >
          <option value="user">Personal — take tests and track progress</option>
          <option value="company">Company — invite candidates and buy access codes</option>
          <option value="admin">Admin — manage content and settings</option>
        </select>
      </label>

      {error && <ErrorMessage message={error} />}

      <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
        {isSubmitting ? 'Creating account…' : 'Create account'}
      </button>
    </form>
  );
}
