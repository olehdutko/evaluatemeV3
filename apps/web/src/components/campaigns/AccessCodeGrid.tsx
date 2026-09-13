'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CORPORATE_API_BASE } from '../../lib/corporate-api';
import { useAuth } from '../../lib/auth/auth-context';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';

interface AccessCodeResult {
  id: string;
  resultCode: string;
  status: string;
  score: number | null;
  maxScore: number | null;
}

interface AccessCode {
  id: string;
  code: string;
  status: string;
  sentAt: string | null;
  sentToEmail: string | null;
  usedCount: number;
  maxUses: number;
  usedAt: string | null;
  createdAt: string;
  testeeName: string | null;
  testeeEmail: string | null;
  questionCount: number | null;
  durationMinutes: number | null;
  result: AccessCodeResult | null;
}

interface AccessCodeGridProps {
  campaignId: string;
  companyId: string;
  refreshToken: number;
  onSent?: (activatedCount: number, remaining: number | null) => void;
}

export function AccessCodeGrid({ campaignId, companyId, refreshToken, onSent }: AccessCodeGridProps) {
  const router = useRouter();
  const { refreshUser } = useAuth();
  const [codes, setCodes] = useState<AccessCode[]>([]);
  const [sendingId, setSendingId] = useState<string | null>(null);
  const [previewCode, setPreviewCode] = useState<AccessCode | null>(null);

  const load = useCallback(() => {
    const params = new URLSearchParams({ companyId, campaignId });
    fetch(`${CORPORATE_API_BASE}/api/v1/corporate/campaigns/${campaignId}/access-codes?${params.toString()}`, { credentials: 'include' })
      .then(async (res) => {
        if (!res.ok) { const _errText = await res.text(); throw new Error(`Failed to load access codes (${res.status}): ${_errText}`); }
        const json = (await res.json()) as { data: AccessCode[] };
        setCodes(json.data ?? []);
      })
      .catch(() => setCodes([]));
  }, [campaignId, companyId]);

  useEffect(() => {
    load();
  }, [load, refreshToken]);

  const send = async (code: AccessCode) => {
    const email = code.testeeEmail ?? code.sentToEmail;
    if (!email) return;
    setSendingId(code.id);
    const res = await fetch(`${CORPORATE_API_BASE}/api/v1/corporate/access-codes/${code.id}/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ companyId, email }),
      credentials: 'include',
    });
    setSendingId(null);
    setPreviewCode(null);
    if (res.ok) {
      const json = (await res.json()) as { data: { activatedCount: number; remaining: number | null; price: number } };
      onSent?.(json.data.activatedCount, json.data.remaining);
      await refreshUser();
      load();
    }
  };

  if (codes.length === 0) {
    return (
      <Card>
        <p className="text-gray-600">No access codes yet.</p>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden p-0">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-bg-tertiary">
            <tr>
              <th className="px-4 py-2 font-mono text-xs uppercase tracking-wider text-text-secondary">Code</th>
              <th className="px-4 py-2 font-mono text-xs uppercase tracking-wider text-text-secondary">Testee</th>
              <th className="px-4 py-2 font-mono text-xs uppercase tracking-wider text-text-secondary">Email</th>
              <th className="px-4 py-2 font-mono text-xs uppercase tracking-wider text-text-secondary">Quiz</th>
              <th className="px-4 py-2 font-mono text-xs uppercase tracking-wider text-text-secondary">Created</th>
              <th className="px-4 py-2 font-mono text-xs uppercase tracking-wider text-text-secondary">Status</th>
              <th className="px-4 py-2 font-mono text-xs uppercase tracking-wider text-text-secondary">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {codes.map((code) => {
              const isSent = !!code.sentAt;
              const hasResult = !!code.result;
              const isWaiting = isSent && !hasResult;
              const canUse = code.status === 'active' && !isSent;
              const displayEmail = code.testeeEmail ?? code.sentToEmail ?? '-';
              const displayName = code.testeeName ?? '-';

              return (
                <tr key={code.id} className={isWaiting ? 'bg-amber-50/50' : ''}>
                  <td className="px-4 py-2 font-mono font-semibold text-text-primary">{code.code}</td>
                  <td className="px-4 py-2 text-text-primary">{displayName}</td>
                  <td className="px-4 py-2 text-text-secondary">{displayEmail}</td>
                  <td className="px-4 py-2 text-text-secondary">
                    {code.questionCount !== null && code.durationMinutes !== null
                      ? `${code.questionCount} q / ${code.durationMinutes} min`
                      : '-'}
                  </td>
                  <td className="px-4 py-2 text-text-secondary whitespace-nowrap">
                    {new Date(code.createdAt).toLocaleString()}
                  </td>
                  <td className="px-4 py-2">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-bold uppercase ${
                        isSent ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-200 text-gray-700'
                      }`}
                    >
                      {isSent ? 'Sent' : 'Ready'}
                    </span>
                  </td>
                  <td className="px-4 py-2">
                    {canUse ? (
                      <Button
                        onClick={() => setPreviewCode(code)}
                        disabled={sendingId === code.id}
                        variant="primary"
                      >
                        {sendingId === code.id ? 'Sending...' : 'Use'}
                      </Button>
                    ) : hasResult ? (
                      <Button
                        onClick={() => router.push(`/campaigns/${campaignId}/results?companyId=${encodeURIComponent(companyId)}`)}
                        variant="secondary"
                      >
                        View Result
                      </Button>
                    ) : (
                      <span className="inline-flex items-center rounded-full bg-amber-100 px-2 py-1 text-xs font-medium text-amber-800">
                        Waiting for quiz
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {previewCode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setPreviewCode(null)} role="presentation"
        >
          <div className="max-w-2xl rounded bg-white p-6 shadow-lg" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
            <h3 className="mb-4 text-lg font-semibold">Email preview</h3>
            <p className="mb-2 text-sm text-gray-600">
              This is the email that would be sent to <strong>{previewCode.testeeEmail}</strong>. After confirming, the access code will be marked as sent and the configured price will be deducted from your account balance.
            </p>
            <div className="mb-4 rounded border bg-gray-50 p-4 font-mono text-sm text-gray-800">
              <p className="font-semibold">To: {previewCode.testeeEmail}</p>
              <p className="font-semibold">Subject: Your EvaluateMe assessment access code</p>
              <hr className="my-2 border-gray-300" />
              <p>Hello,</p>
              <p className="mt-2">
                You have been invited to take an assessment. Use the access code below to start:
              </p>
              <p className="mt-2 text-lg font-bold">{previewCode.code}</p>
              {previewCode.questionCount !== null && previewCode.durationMinutes !== null && (
                <p className="mt-2">
                  The assessment contains {previewCode.questionCount} questions and must be completed within {previewCode.durationMinutes} minutes.
                </p>
              )}
              <p className="mt-2">
                Start here: {typeof window !== 'undefined' ? window.location.origin : ''}/start?accessCode={previewCode.code}
              </p>
              <p className="mt-2">Good luck!</p>
            </div>
            <div className="flex justify-end gap-2">
              <Button onClick={() => setPreviewCode(null)} variant="secondary">Cancel</Button>
              <Button onClick={() => void send(previewCode)} disabled={sendingId === previewCode.id}>
                {sendingId === previewCode.id ? 'Marking as sent...' : 'Mark as sent'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
