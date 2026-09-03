'use client';

import React, { useState } from 'react';
import { useAuth } from '../../lib/auth/auth-context';
import { ErrorMessage } from '../ui/ErrorMessage';
import { CountryAutocomplete } from '../ui/CountryAutocomplete';

export function RegisterForm(): JSX.Element {
  const { register } = useAuth();
  const [role, setRole] = useState<'user' | 'company'>('user');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [middleName, setMiddleName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [country, setCountry] = useState('');
  const [city, setCity] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isCompany = role === 'company';

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);
    const payload: Parameters<typeof register>[0] = {
      email,
      password,
      role,
      username: username.trim(),
      country,
      city: city.trim() || undefined,
      phone: phone.trim() || undefined,
    };
    if (isCompany) {
      payload.companyName = companyName.trim();
    } else {
      payload.firstName = firstName.trim();
      payload.lastName = lastName.trim();
      payload.middleName = middleName.trim() || undefined;
      payload.birthDate = birthDate;
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
        <span className="label-mono">Username</span>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          minLength={2}
          maxLength={100}
          autoComplete="username"
          className="input-field"
        />
      </label>

      <div
        key={role}
        className="space-y-5 animate-form-reveal"
      >
        {isCompany ? (
          <label className="block">
            <span className="label-mono">Company name</span>
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              required
              maxLength={255}
              autoComplete="organization"
              className="input-field"
            />
          </label>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <label className="block">
                <span className="label-mono">Last name</span>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                  maxLength={100}
                  autoComplete="family-name"
                  className="input-field"
                />
              </label>
              <label className="block">
                <span className="label-mono">First name</span>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                  maxLength={100}
                  autoComplete="given-name"
                  className="input-field"
                />
              </label>
              <label className="block">
                <span className="label-mono">Middle name</span>
                <input
                  type="text"
                  value={middleName}
                  onChange={(e) => setMiddleName(e.target.value)}
                  maxLength={100}
                  autoComplete="additional-name"
                  className="input-field"
                />
              </label>
            </div>

            <label className="block">
              <span className="label-mono">Date of birth</span>
              <input
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                required
                className="input-field"
              />
            </label>
          </>
        )}
      </div>

      <label className="block">
        <span className="label-mono">Country of residence</span>
        <CountryAutocomplete value={country} onChange={setCountry} required placeholder="Search country" />
      </label>

      <label className="block">
        <span className="label-mono">City (optional)</span>
        <input
          type="text"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          maxLength={100}
          autoComplete="address-level2"
          className="input-field"
        />
      </label>

      <label className="block">
        <span className="label-mono">Phone (optional)</span>
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          maxLength={50}
          autoComplete="tel"
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

      {error && <ErrorMessage message={error} />}

      <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
        {isSubmitting ? 'Creating account…' : 'Create account'}
      </button>
    </form>
  );
}
