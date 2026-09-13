'use client';

import React, { useEffect, useState } from 'react';
import { getEmailServiceConfig, updateEmailServiceConfig, testEmailService } from '../../../lib/admin.api';
import { ErrorMessage } from '../../../components/ui/ErrorMessage';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';

interface ConfigForm {
  provider: string;
  smtpHost: string;
  smtpPort: number;
  smtpUser: string;
  smtpPass: string;
  fromEmail: string;
  secure: boolean;
  enabled: boolean;
}

const defaultConfig: ConfigForm = {
  provider: 'gmail',
  smtpHost: 'smtp.gmail.com',
  smtpPort: 587,
  smtpUser: '',
  smtpPass: '',
  fromEmail: '',
  secure: false,
  enabled: false,
};

export default function AdminEmailServicePage(): JSX.Element {
  const [config, setConfig] = useState<ConfigForm>(defaultConfig);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [testError, setTestError] = useState<string | null>(null);
  const [testSuccess, setTestSuccess] = useState<string | null>(null);

  useEffect(() => {
    getEmailServiceConfig()
      .then((response) => {
        if (response.data) {
          setConfig(response.data);
        }
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load config'))
      .finally(() => setLoading(false));
  }, []);

  function handleChange<K extends keyof ConfigForm>(key: K, value: ConfigForm[K]) {
    setConfig((prev) => ({ ...prev, [key]: value }));
  }

  function handleSave() {
    setSaving(true);
    setSaveError(null);
    updateEmailServiceConfig(config)
      .then((response) => {
        if (response.data) {
          setConfig(response.data);
        }
      })
      .catch((err) => setSaveError(err instanceof Error ? err.message : 'Failed to save config'))
      .finally(() => setSaving(false));
  }

  function handleTest(to: string) {
    setTesting(true);
    setTestError(null);
    setTestSuccess(null);
    testEmailService(to)
      .then((response) => setTestSuccess(response.message))
      .catch((err) => setTestError(err instanceof Error ? err.message : 'Failed to send test email'))
      .finally(() => setTesting(false));
  }

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <p className="text-text-secondary font-body">Loading email service config…</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <header className="mb-10 border-b border-border pb-6">
        <p className="font-mono text-xs uppercase tracking-[0.12em] text-accent mb-3">Messaging</p>
        <h1 className="font-display text-3xl sm:text-4xl font-bold text-text-primary">Email Service</h1>
        <p className="mt-3 text-text-secondary font-body max-w-prose">
          Configure SMTP credentials so the application can send transactional emails to users.
          For Gmail use an App Password, not your Google account password.
        </p>
      </header>

      {error && <ErrorMessage message={error} className="mb-6" />}
      {saveError && <ErrorMessage message={saveError} className="mb-6" />}

      <Card className="mb-8">
        <div className="space-y-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <label className="block">
              <span className="label-mono">Provider</span>
              <select
                value={config.provider}
                onChange={(e) => handleChange('provider', e.target.value)}
                className="input-field w-full"
              >
                <option value="gmail">Gmail</option>
                <option value="custom">Custom / Other</option>
              </select>
            </label>

            <label className="block">
              <span className="label-mono">SMTP Host</span>
              <input
                type="text"
                value={config.smtpHost}
                onChange={(e) => handleChange('smtpHost', e.target.value)}
                placeholder="smtp.gmail.com"
                className="input-field w-full"
              />
            </label>

            <label className="block">
              <span className="label-mono">SMTP Port</span>
              <input
                type="number"
                min={1}
                max={65535}
                value={config.smtpPort}
                onChange={(e) => handleChange('smtpPort', Number(e.target.value))}
                className="input-field w-full"
              />
            </label>

            <label className="block">
              <span className="label-mono">SMTP User (login / email)</span>
              <input
                type="text"
                value={config.smtpUser}
                onChange={(e) => handleChange('smtpUser', e.target.value)}
                placeholder="you@gmail.com"
                className="input-field w-full"
              />
            </label>

            <label className="block sm:col-span-2">
              <span className="label-mono">SMTP Password / App Password</span>
              <input
                type="password"
                value={config.smtpPass}
                onChange={(e) => handleChange('smtpPass', e.target.value)}
                placeholder="16-character App Password for Gmail"
                className="input-field w-full"
              />
              <p className="text-text-muted text-xs mt-1 font-body">
                For Gmail generate an App Password at Google Account → Security → 2-Step Verification → App passwords.
              </p>
            </label>

            <label className="block sm:col-span-2">
              <span className="label-mono">From Email</span>
              <input
                type="email"
                value={config.fromEmail}
                onChange={(e) => handleChange('fromEmail', e.target.value)}
                placeholder="noreply@evaluateme.it"
                className="input-field w-full"
              />
            </label>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 pt-2">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={config.secure}
                onChange={(e) => handleChange('secure', e.target.checked)}
                className="w-4 h-4 accent-accent"
              />
              <span className="font-body text-text-primary">Use secure connection (SSL/TLS)</span>
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={config.enabled}
                onChange={(e) => handleChange('enabled', e.target.checked)}
                className="w-4 h-4 accent-accent"
              />
              <span className="font-body text-text-primary">Enable email sending</span>
            </label>
          </div>

          <div className="pt-4">
            <Button onClick={() => void handleSave()} disabled={saving}>
              {saving ? 'Saving…' : 'Save Configuration'}
            </Button>
          </div>
        </div>
      </Card>

      <Card>
        <h2 className="font-display text-xl font-bold text-text-primary mb-4">Send Test Email</h2>
        <p className="text-text-secondary font-body mb-4">
          Enter an email address and click “Send Test” to verify your SMTP settings.
        </p>

        {testError && <ErrorMessage message={testError} className="mb-4" />}
        {testSuccess && (
          <div className="mb-4 p-4 border-l-4 border-success bg-success/5 text-text-primary font-body">
            {testSuccess}
          </div>
        )}

        <TestEmailForm onSend={handleTest} disabled={testing || !config.enabled} />
      </Card>
    </div>
  );
}

function TestEmailForm({
  onSend,
  disabled,
}: {
  onSend: (to: string) => void;
  disabled: boolean;
}): JSX.Element {
  const [to, setTo] = useState('');

  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <input
        type="email"
        value={to}
        onChange={(e) => setTo(e.target.value)}
        placeholder="test@example.com"
        className="input-field flex-1"
      />
      <Button onClick={() => void onSend(to)} disabled={disabled || !to.trim()}>
        Send Test
      </Button>
    </div>
  );
}
