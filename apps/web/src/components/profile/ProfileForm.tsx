'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../lib/auth/auth-context';
import { updateProfile, changePassword, forgotPassword } from '../../lib/auth.api';
import { ErrorMessage } from '../ui/ErrorMessage';
import { PageHeader } from '../ui/PageHeader';
import { validatePasswordQuality, passwordScoreLabel } from '../../lib/schemas/password';
import { CountryAutocomplete } from '../ui/CountryAutocomplete';

interface PasswordStrengthProps {
  password: string;
}

function PasswordStrength({ password }: PasswordStrengthProps): JSX.Element | null {
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

export function ProfileForm(): JSX.Element {
  const { user, refreshUser } = useAuth();

  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [middleName, setMiddleName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [country, setCountry] = useState('');
  const [city, setCity] = useState('');
  const [phone, setPhone] = useState('');
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const [resetEmail, setResetEmail] = useState('');
  const [resetError, setResetError] = useState<string | null>(null);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [isRequestingReset, setIsRequestingReset] = useState(false);

  useEffect(() => {
    if (user) {
      setEmail(user.email);
      setUsername(user.username ?? '');
      setFirstName(user.firstName ?? '');
      setLastName(user.lastName ?? '');
      setMiddleName(user.middleName ?? '');
      setBirthDate(user.birthDate ?? '');
      setCountry(user.country ?? '');
      setCity(user.city ?? '');
      setPhone(user.phone ?? '');
      setResetEmail(user.email);
    }
  }, [user]);

  async function handleProfileSubmit(event: React.FormEvent): Promise<void> {
    event.preventDefault();
    setProfileError(null);
    setProfileSuccess(false);
    setIsUpdatingProfile(true);

    try {
      const payload: Parameters<typeof updateProfile>[0] = {};
      // Email is read-only on this page, so it is never included in the payload.
      const trimmedUsername = username.trim();
      if (trimmedUsername !== (user?.username ?? '')) {
        payload.username = trimmedUsername;
      }
      if (firstName.trim() !== (user?.firstName ?? '')) {
        payload.firstName = firstName.trim();
      }
      if (lastName.trim() !== (user?.lastName ?? '')) {
        payload.lastName = lastName.trim();
      }
      if (middleName.trim() !== (user?.middleName ?? '')) {
        payload.middleName = middleName.trim() || null;
      }
      if (birthDate !== (user?.birthDate ?? '')) {
        payload.birthDate = birthDate || null;
      }
      if (country !== (user?.country ?? '')) {
        payload.country = country;
      }
      if (city.trim() !== (user?.city ?? '')) {
        payload.city = city.trim() || null;
      }
      if (phone.trim() !== (user?.phone ?? '')) {
        payload.phone = phone.trim() || null;
      }

      if (Object.keys(payload).length === 0) {
        setProfileSuccess(true);
        setIsUpdatingProfile(false);
        return;
      }

      await updateProfile(payload);
      await refreshUser();
      setProfileSuccess(true);
    } catch (err) {
      setProfileError(err instanceof Error ? err.message : 'Failed to update profile');
    } finally {
      setIsUpdatingProfile(false);
    }
  }

  async function handlePasswordSubmit(event: React.FormEvent): Promise<void> {
    event.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(false);

    const quality = validatePasswordQuality(newPassword);
    if (!quality.valid) {
      setPasswordError(quality.errors.join('. '));
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('New password and confirmation do not match.');
      return;
    }

    setIsChangingPassword(true);
    try {
      await changePassword({
        currentPassword,
        newPassword,
        confirmPassword,
      });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setPasswordSuccess(true);
    } catch (err) {
      setPasswordError(err instanceof Error ? err.message : 'Failed to change password');
    } finally {
      setIsChangingPassword(false);
    }
  }

  async function handleResetRequest(event: React.FormEvent): Promise<void> {
    event.preventDefault();
    setResetError(null);
    setResetSuccess(false);
    setIsRequestingReset(true);

    try {
      await forgotPassword({ email: resetEmail.trim() });
      setResetSuccess(true);
    } catch (err) {
      setResetError(err instanceof Error ? err.message : 'Failed to request password reset');
    } finally {
      setIsRequestingReset(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      <PageHeader title="Your profile" description="Manage your account details and security settings." />

      {/* Profile details */}
      <section className="panel p-6 sm:p-8">
        <h2 className="font-display text-xl font-bold text-text-primary mb-6">Profile details</h2>
        <form onSubmit={(event) => { void handleProfileSubmit(event); }} className="space-y-5">
          <div className="block">
            <span className="label-mono">Email</span>
            <input
              type="email"
              value={email}
              readOnly
              disabled
              autoComplete="email"
              className="input-field cursor-not-allowed opacity-70"
              placeholder="you@example.com"
              aria-describedby="email-readonly-note"
            />
            <p id="email-readonly-note" className="mt-1.5 font-mono text-xs text-text-secondary">
              Email cannot be changed here. Contact support if you need to update it.
            </p>
          </div>

          <label className="block">
            <span className="label-mono">Username</span>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              minLength={2}
              maxLength={100}
              autoComplete="username"
              className="input-field"
              placeholder="public-username"
            />
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <label className="block">
              <span className="label-mono">Last name</span>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
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
              className="input-field"
            />
          </label>

          <label className="block">
            <span className="label-mono">Country of residence</span>
            <CountryAutocomplete value={country} onChange={setCountry} placeholder="Search country" />
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

          {profileError && <ErrorMessage message={profileError} />}
          {profileSuccess && (
            <div className="border-l-4 border-success bg-success/5 p-4" role="status">
              <p className="font-mono text-xs uppercase tracking-wider text-success mb-1">Saved</p>
              <p className="font-body text-text-primary">Profile updated successfully.</p>
            </div>
          )}

          <button type="submit" disabled={isUpdatingProfile} className="btn-primary">
            {isUpdatingProfile ? 'Saving…' : 'Save profile'}
          </button>
        </form>
      </section>

      {/* Privacy & Security */}
      <section className="panel p-6 sm:p-8">
        <h2 className="font-display text-xl font-bold text-text-primary mb-2">Privacy & Security</h2>
        <p className="text-text-secondary font-body mb-6">Change your password or request a reset link.</p>

        <form onSubmit={(event) => { void handlePasswordSubmit(event); }} className="space-y-5">
          <h3 className="font-display text-lg font-semibold text-text-primary">Change password</h3>

          <label className="block">
            <span className="label-mono">Current password</span>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              autoComplete="current-password"
              className="input-field"
              placeholder="Enter your current password"
            />
          </label>

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

          {passwordError && <ErrorMessage message={passwordError} />}
          {passwordSuccess && (
            <div className="border-l-4 border-success bg-success/5 p-4" role="status">
              <p className="font-mono text-xs uppercase tracking-wider text-success mb-1">Saved</p>
              <p className="font-body text-text-primary">Password changed successfully.</p>
            </div>
          )}

          <button type="submit" disabled={isChangingPassword} className="btn-primary">
            {isChangingPassword ? 'Changing password…' : 'Change password'}
          </button>
        </form>

        <div className="border-t border-border mt-8 pt-8">
          <h3 className="font-display text-lg font-semibold text-text-primary mb-4">Forgot your current password?</h3>
          <form onSubmit={(event) => { void handleResetRequest(event); }} className="space-y-5">
            <label className="block">
              <span className="label-mono">Send reset link to</span>
              <input
                type="email"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                required
                autoComplete="email"
                className="input-field"
                placeholder="you@example.com"
              />
            </label>

            {resetError && <ErrorMessage message={resetError} />}
            {resetSuccess && (
              <div className="border-l-4 border-success bg-success/5 p-4" role="status">
                <p className="font-mono text-xs uppercase tracking-wider text-success mb-1">Sent</p>
                <p className="font-body text-text-primary">
                  If an account exists for this email, you will receive a reset link shortly.
                </p>
              </div>
            )}

            <button type="submit" disabled={isRequestingReset} className="btn-secondary">
              {isRequestingReset ? 'Sending…' : 'Reset password via email'}
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
