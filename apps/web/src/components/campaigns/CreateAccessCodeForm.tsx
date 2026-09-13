'use client';

import { useState } from 'react';
import { CORPORATE_API_BASE } from '../../lib/corporate-api';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { ErrorMessage } from '../ui/ErrorMessage';

interface CreateAccessCodeFormProps {
  campaignId: string;
  companyId: string;
  onCreated: () => void;
}

export function CreateAccessCodeForm({ campaignId, companyId, onCreated }: CreateAccessCodeFormProps) {
  const [testeeName, setTesteeName] = useState('');
  const [testeeEmail, setTesteeEmail] = useState('');
  const [questionCount, setQuestionCount] = useState<number | ''>('');
  const [durationMinutes, setDurationMinutes] = useState<number | ''>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEmailValid = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const isFormValid =
    testeeName.trim().length > 0 &&
    isEmailValid(testeeEmail.trim()) &&
    typeof questionCount === 'number' &&
    questionCount > 0 &&
    typeof durationMinutes === 'number' &&
    durationMinutes > 0;

  const create = async () => {
    if (!isFormValid) return;
    setLoading(true);
    setError(null);
    const payload = {
      companyId,
      testeeName: testeeName.trim(),
      testeeEmail: testeeEmail.trim(),
      questionCount: Number(questionCount),
      durationMinutes: Number(durationMinutes),
    };
    const res = await fetch(`${CORPORATE_API_BASE}/api/v1/corporate/campaigns/${campaignId}/access-codes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      credentials: 'include',
    });
    if (!res.ok) {
      const err = (await res.json().catch(() => ({}))) as { message?: string };
      setError(err.message || 'Failed to create access code');
    } else {
      setTesteeName('');
      setTesteeEmail('');
      setQuestionCount('');
      setDurationMinutes('');
      onCreated();
    }
    setLoading(false);
  };

  return (
    <Card className="mb-6">
      {error && <ErrorMessage message={error} />}
      <div className="flex flex-col items-end gap-3 lg:flex-row">
        <label className="block flex-1">
          <span className="label-mono">Testee name</span>
          <input
            id="testeeName"
            type="text"
            value={testeeName}
            onChange={(e) => setTesteeName(e.target.value)}
            placeholder="Name"
            className="input-field w-full"
          />
        </label>
        <label className="block flex-1">
          <span className="label-mono">Testee email</span>
          <input
            id="testeeEmail"
            type="email"
            value={testeeEmail}
            onChange={(e) => setTesteeEmail(e.target.value)}
            placeholder="Email"
            className="input-field w-full"
          />
        </label>
        <label className="block w-full sm:w-28">
          <span className="label-mono">Questions</span>
          <input
            id="questionCount"
            type="number"
            min={1}
            value={questionCount}
            onChange={(e) => setQuestionCount(e.target.value === '' ? '' : Number(e.target.value))}
            placeholder="Qty"
            className="input-field w-full"
          />
        </label>
        <label className="block w-full sm:w-28">
          <span className="label-mono">Minutes</span>
          <input
            id="durationMinutes"
            type="number"
            min={1}
            value={durationMinutes}
            onChange={(e) => setDurationMinutes(e.target.value === '' ? '' : Number(e.target.value))}
            placeholder="Min"
            className="input-field w-full"
          />
        </label>
        <Button onClick={() => void create()} disabled={!isFormValid || loading} className="w-full lg:w-auto">
          {loading ? 'Creating...' : 'Create'}
        </Button>
      </div>
    </Card>
  );
}
