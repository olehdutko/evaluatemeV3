'use client';

import React, { useState } from 'react';
import { useAuth } from '../../lib/auth/auth-context';
import { ErrorMessage } from '../ui/ErrorMessage';

export function RegisterForm(): JSX.Element {
  const { register } = useAuth();
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'user' | 'company'>('user');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);
    const payload: { email: string; password: string; role: 'user' | 'company'; username?: string } = {
      email,
      password,
      role,
    };
    if (username.trim()) {
      payload.username = username.trim();
    }
    register(payload)
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
        <span className="label-mono">Username (optional)</span>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          minLength={2}
          maxLength={100}
          autoComplete="username"
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
          onChange={(e) => setRole(e.target.value as 'user' | 'company')}
          className="input-field"
        >
          <option value="user">Personal — take tests and track progress</option>
          <option value="company">Company — invite candidates and buy access codes</option>
        </select>
      </label>

      {error && <ErrorMessage message={error} />}

      <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
        {isSubmitting ? 'Creating account…' : 'Create account'}
      </button>
    </form>
  );
}
