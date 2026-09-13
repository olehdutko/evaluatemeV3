'use client';

import { useState } from 'react';
import { CORPORATE_API_BASE } from '../../lib/corporate-api';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { ErrorMessage } from '../ui/ErrorMessage';

interface CreatedAccessCode {
  id: string;
  code: string;
}

interface CreateAccessCodeFormProps {
  campaignId: string;
  companyId: string;
  onCreated: (createdCount: number, activatedCount: number, limit: number | null) => void;
}

export function CreateAccessCodeForm({ campaignId, companyId, onCreated }: CreateAccessCodeFormProps) {
  const [testeeName, setTesteeName] = useState('');
  const [testeeEmail, setTesteeEmail] = useState('');
  const [questionCount, setQuestionCount] = useState<number | ''>('');
  const [durationMinutes, setDurationMinutes] = useState<number | ''>('');
  const [created, setCreated] = useState<CreatedAccessCode | null>(null);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isFormValid =
    testeeName.trim().length > 0 &&
    testeeEmail.trim().length > 0 &&
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
      setCreated(null);
    } else {
      const json = (await res.json()) as {
        data: {
          id: string;
          code: string;
          createdCount: number;
          activatedCount: number;
          limit: number | null;
        };
      };
      setCreated({ id: json.data.id, code: json.data.code });
      onCreated(json.data.createdCount, json.data.activatedCount, json.data.limit);
    }
    setLoading(false);
  };

  const useCode = async () => {
    if (!created) return;
    setSending(true);
    setError(null);
    const res = await fetch(`${CORPORATE_API_BASE}/api/v1/corporate/access-codes/${created.id}/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ companyId }),
      credentials: 'include',
    });
    if (!res.ok) {
      const err = (await res.json().catch(() => ({}))) as { message?: string };
      setError(err.message || 'Failed to send access code');
    } else {
      const json = (await res.json()) as { data: { activatedCount: number; remaining: number | null } };
      onCreated(0, json.data.activatedCount, json.data.remaining);
    }
    setSending(false);
  };

  return (
    <Card className="mb-6">
      {error && <ErrorMessage message={error} />}
      <div className="mb-4 grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="testeeName" className="mb-1 block text-sm font-medium">
            Testee name
          </label>
          <input
            id="testeeName"
            type="text"
            value={testeeName}
            onChange={(e) => setTesteeName(e.target.value)}
            placeholder="Enter testee name"
            className="w-full rounded border px-3 py-2"
          />
        </div>
        <div>
          <label htmlFor="testeeEmail" className="mb-1 block text-sm font-medium">
            Testee email
          </label>
          <input
            id="testeeEmail"
            type="email"
            value={testeeEmail}
            onChange={(e) => setTesteeEmail(e.target.value)}
            placeholder="Enter testee email"
            className="w-full rounded border px-3 py-2"
          />
        </div>
        <div>
          <label htmlFor="questionCount" className="mb-1 block text-sm font-medium">
            Number of questions
          </label>
          <input
            id="questionCount"
            type="number"
            min={1}
            value={questionCount}
            onChange={(e) => setQuestionCount(e.target.value === '' ? '' : Number(e.target.value))}
            placeholder="Questions"
            className="w-full rounded border px-3 py-2"
          />
        </div>
        <div>
          <label htmlFor="durationMinutes" className="mb-1 block text-sm font-medium">
            Number of minutes
          </label>
          <input
            id="durationMinutes"
            type="number"
            min={1}
            value={durationMinutes}
            onChange={(e) => setDurationMinutes(e.target.value === '' ? '' : Number(e.target.value))}
            placeholder="Minutes"
            className="w-full rounded border px-3 py-2"
          />
        </div>
      </div>

      <div className="flex gap-2">
        <Button onClick={() => void create()} disabled={!isFormValid || loading}>
          {loading ? 'Creating...' : 'Create Access Code'}
        </Button>
        <Button onClick={() => void useCode()} disabled={!created || sending || loading} variant="secondary">
          {sending ? 'Sending...' : 'Use Access Code'}
        </Button>
      </div>

      {created && (
        <div className="mt-4 rounded border bg-gray-50 p-3">
          <p className="text-sm text-gray-600">Generated access code:</p>
          <p className="text-lg font-mono font-semibold">{created.code}</p>
        </div>
      )}
    </Card>
  );
}
