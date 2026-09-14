'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CORPORATE_API_BASE } from '../../lib/corporate-api';
import { useAuth } from '../../lib/auth/auth-context';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Loading } from '../ui/Loading';
import { Modal } from '../ui/Modal';
import { ErrorMessage } from '../ui/ErrorMessage';

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
  const [previewEmail, setPreviewEmail] = useState<{ to: string; subject: string; html: string; text: string } | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [deleteCode, setDeleteCode] = useState<AccessCode | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

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

  const loadPreview = async (code: AccessCode) => {
    const email = code.testeeEmail ?? code.sentToEmail;
    if (!email) return;
    setPreviewCode(code);
    setPreviewLoading(true);
    setPreviewError(null);
    setPreviewEmail(null);
    try {
      const res = await fetch(
        `${CORPORATE_API_BASE}/api/v1/corporate/access-codes/${code.id}/email-preview?${new URLSearchParams({ companyId, email }).toString()}`,
        { credentials: 'include' },
      );
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { message?: string };
        throw new Error(body.message || `Failed to load preview (${res.status})`);
      }
      const json = (await res.json()) as { data: { to: string; subject: string; html: string; text: string } };
      setPreviewEmail(json.data);
    } catch (err) {
      setPreviewError(err instanceof Error ? err.message : 'Failed to load preview');
    } finally {
      setPreviewLoading(false);
    }
  };

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
    setPreviewEmail(null);
    if (res.ok) {
      const json = (await res.json()) as { data: { activatedCount: number; remaining: number | null; price: number } };
      onSent?.(json.data.activatedCount, json.data.remaining);
      await refreshUser();
      load();
    }
  };

  const closePreview = () => {
    setPreviewCode(null);
    setPreviewEmail(null);
    setPreviewError(null);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteCode) return;
    setDeleteLoading(true);
    setDeleteError(null);
    try {
      const res = await fetch(`${CORPORATE_API_BASE}/api/v1/corporate/access-codes/${deleteCode.id}?${new URLSearchParams({ companyId }).toString()}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { message?: string };
        throw new Error(body.message || `Failed to delete access code (${res.status})`);
      }
      setDeleteCode(null);
      await refreshUser();
      load();
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : 'Failed to delete access code');
    } finally {
      setDeleteLoading(false);
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
                    <div className="flex items-center gap-2">
                      {canUse ? (
                        <Button
                          onClick={() => void loadPreview(code)}
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
                      <Button
                        onClick={() => setDeleteCode(code)}
                        disabled={deleteLoading}
                        variant="secondary"
                        className="text-error hover:text-error"
                      >
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {previewCode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={closePreview} role="presentation"
        >
          <div className="max-w-2xl max-h-[80vh] overflow-y-auto rounded bg-white p-6 shadow-lg" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
            <h3 className="mb-4 text-lg font-semibold">Email preview</h3>
            <p className="mb-2 text-sm text-gray-600">
              This is the email that would be sent to <strong>{previewCode.testeeEmail}</strong>. After confirming, the access code will be marked as sent and the configured price will be deducted from your account balance.
            </p>
            {previewLoading ? (
              <Loading message="Loading preview…" />
            ) : previewError ? (
              <p className="mb-4 text-sm text-red-600">{previewError}</p>
            ) : previewEmail ? (
              <div className="mb-4 rounded border bg-gray-50 p-4 text-sm text-gray-800">
                <p className="font-semibold">To: {previewEmail.to}</p>
                <p className="font-semibold">Subject: {previewEmail.subject}</p>
                <hr className="my-2 border-gray-300" />
                <div
                  className="prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: previewEmail.html }}
                />
              </div>
            ) : null}
            <div className="flex justify-end gap-2">
              <Button onClick={closePreview} variant="secondary">Cancel</Button>
              <Button onClick={() => void send(previewCode)} disabled={sendingId === previewCode.id || !previewEmail}>
                {sendingId === previewCode.id ? 'Marking as sent...' : 'Mark as sent'}
              </Button>
            </div>
          </div>
        </div>
      )}

      <Modal
        open={!!deleteCode}
        onClose={() => setDeleteCode(null)}
        title="Delete access code?"
      >
        <div className="space-y-4">
          <p className="font-body text-text-primary">
            Are you sure you want to delete access code <strong className="font-mono">{deleteCode?.code}</strong>?
          </p>
          <p className="font-body text-text-secondary text-sm">
            {deleteCode?.sentAt ? 'This code has already been sent. ' : ''}
            {deleteCode?.result ? 'This code has a completed quiz result. ' : ''}
            This action cannot be undone.
          </p>
          {deleteError && <ErrorMessage message={deleteError} />}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Button onClick={() => setDeleteCode(null)} variant="secondary" className="flex-1" disabled={deleteLoading}>
              Cancel
            </Button>
            <Button onClick={() => void handleDeleteConfirm()} variant="primary" className="flex-1" disabled={deleteLoading}>
              {deleteLoading ? 'Deleting...' : 'Delete'}
            </Button>
          </div>
        </div>
      </Modal>
    </Card>
  );
}
