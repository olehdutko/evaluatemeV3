'use client';

import { useCallback, useEffect, useState } from 'react';
import { CORPORATE_API_BASE } from '../../lib/corporate-api';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';

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
}

interface AccessCodeGridProps {
  campaignId: string;
  companyId: string;
  refreshToken: number;
}

export function AccessCodeGrid({ campaignId, companyId, refreshToken }: AccessCodeGridProps) {
  const [codes, setCodes] = useState<AccessCode[]>([]);
  const [email, setEmail] = useState('');
  const [sendingId, setSendingId] = useState<string | null>(null);

  const load = useCallback(() => {
    fetch(`${CORPORATE_API_BASE}/api/v1/corporate/campaigns/${campaignId}/access-codes?companyId=${companyId}`, { credentials: 'include' })
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

  const send = async (id: string) => {
    if (!email) return;
    setSendingId(id);
    const res = await fetch(`${CORPORATE_API_BASE}/api/v1/corporate/access-codes/${id}/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ companyId, email }),
      credentials: 'include',
    });
    setSendingId(null);
    if (res.ok) load();
  };

  return (
    <Card>
      <div className="mb-4 flex gap-2">
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Candidate email"
          className="flex-1 rounded border px-3 py-2"
        />
      </div>
      {codes.length === 0 ? (
        <p className="text-gray-600">No access codes yet.</p>
      ) : (
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b">
              <th className="pb-2">Code</th>
              <th className="pb-2">Status</th>
              <th className="pb-2">Sent</th>
              <th className="pb-2">Used</th>
              <th className="pb-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {codes.map((code) => (
              <tr key={code.id} className="border-b">
                <td className="py-2 font-mono">{code.code}</td>
                <td className="py-2">{code.status}</td>
                <td className="py-2">{code.sentAt ? `Sent to ${code.sentToEmail}` : 'Not sent'}</td>
                <td className="py-2">{code.usedCount}/{code.maxUses}</td>
                <td className="py-2">
                  <Button
                    onClick={() => void send(code.id)}
                    disabled={sendingId === code.id || !email || code.status !== 'active'}
                    variant="secondary"
                  >
                    {sendingId === code.id ? 'Sending...' : 'Send'}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </Card>
  );
}
