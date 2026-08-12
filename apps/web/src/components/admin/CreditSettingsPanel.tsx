'use client';

import React, { useEffect, useState } from 'react';
import { getCreditSettings, updateCreditSetting } from '../../lib/admin.api';
import { ErrorMessage } from '../ui/ErrorMessage';

interface SettingRow {
  id: string;
  key: string;
  value: string;
  updatedByUserId: string;
  updatedAt: string;
}

const labels: Record<string, string> = {
  test_price_credits: 'Price per test (credits)',
  access_code_price_credits: 'Price per access code (credits)',
  credit_to_usd_rate: 'Credit to USD rate (USD per credit)',
  base_credits_per_user: 'Base credits per user',
  bonus_credits_new_user: 'Bonus credits for new users',
};

export function CreditSettingsPanel(): JSX.Element {
  const [settings, setSettings] = useState<SettingRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savingKey, setSavingKey] = useState<string | null>(null);

  useEffect(() => {
    getCreditSettings()
      .then((response) => {
        setSettings(response.data);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Failed to load settings');
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  function handleUpdate(key: string, value: string) {
    setSavingKey(key);
    setError(null);
    updateCreditSetting(key, value)
      .then((response) => {
        setSettings((prev) =>
          prev.map((row) => (row.key === key ? { ...row, value: response.data.value, updatedAt: response.data.updatedAt } : row)),
        );
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Failed to update setting');
      })
      .finally(() => {
        setSavingKey(null);
      });
  }

  if (loading) {
    return <p className="text-text-secondary font-body">Loading pricing settings…</p>;
  }

  return (
    <div className="space-y-6">
      {error && <ErrorMessage message={error} />}

      {settings.length === 0 ? (
        <div className="panel p-6">
          <p className="text-text-secondary font-body">No credit settings configured yet. Edit a value below to create one.</p>
        </div>
      ) : (
        <div className="panel overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-bg-secondary border-b border-border">
              <tr className="font-mono text-xs uppercase tracking-wider text-text-secondary">
                <th className="px-6 py-3">Setting</th>
                <th className="px-6 py-3">Value</th>
                <th className="px-6 py-3">Updated</th>
                <th className="px-6 py-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {settings.map((row) => (
                <CreditSettingRow key={row.key} row={row} onSave={handleUpdate} isSaving={savingKey === row.key} />
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        {Object.entries(labels)
          .filter(([key]) => !settings.some((s) => s.key === key))
          .map(([key, label]) => (
            <NewSettingCard key={key} settingKey={key} label={label} onSave={handleUpdate} isSaving={savingKey === key} />
          ))}
      </div>
    </div>
  );
}

function CreditSettingRow({
  row,
  onSave,
  isSaving,
}: {
  row: SettingRow;
  onSave: (key: string, value: string) => void;
  isSaving: boolean;
}): JSX.Element {
  const [value, setValue] = useState(row.value);

  return (
    <tr>
      <td className="px-6 py-4 font-body text-text-primary">{labels[row.key] || row.key}</td>
      <td className="px-6 py-4">
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          disabled={isSaving}
          className="input-field max-w-xs"
        />
      </td>
      <td className="px-6 py-4 text-text-secondary font-mono text-xs">
        {new Date(row.updatedAt).toLocaleString()}
      </td>
      <td className="px-6 py-4">
        <button
          type="button"
          onClick={() => onSave(row.key, value)}
          disabled={isSaving || value === row.value}
          className="btn-primary text-sm py-2 px-4 disabled:opacity-50"
        >
          {isSaving ? 'Saving…' : 'Save'}
        </button>
      </td>
    </tr>
  );
}

function NewSettingCard({
  settingKey,
  label,
  onSave,
  isSaving,
}: {
  settingKey: string;
  label: string;
  onSave: (key: string, value: string) => void;
  isSaving: boolean;
}): JSX.Element {
  const [value, setValue] = useState('');

  return (
    <div className="panel p-5">
      <p className="font-mono text-xs uppercase tracking-wider text-accent mb-2">{label}</p>
      <div className="flex gap-3">
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Enter value"
          disabled={isSaving}
          className="input-field flex-1"
        />
        <button
          type="button"
          onClick={() => onSave(settingKey, value)}
          disabled={isSaving || value.trim().length === 0}
          className="btn-primary text-sm py-2 px-4 disabled:opacity-50"
        >
          {isSaving ? 'Saving…' : 'Create'}
        </button>
      </div>
    </div>
  );
}
