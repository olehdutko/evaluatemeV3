'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { Card } from '../../../components/ui/Card';
import { ErrorMessage } from '../../../components/ui/ErrorMessage';
import { Loading } from '../../../components/ui/Loading';
import { Button } from '../../../components/ui/Button';
import { CORPORATE_API_BASE } from '../../../lib/corporate-api';
import { CreateAccessCodeForm } from '../../../components/campaigns/CreateAccessCodeForm';
import { AccessCodeGrid } from '../../../components/campaigns/AccessCodeGrid';
import { Breadcrumbs } from '../../../components/ui/Breadcrumbs';

interface HistoryItem {
  id: string;
  action: string;
  status: string | null;
  changedByUserId: string;
  metadata: string | null;
  changedAt: string;
}

interface Campaign {
  id: string;
  name: string;
  description: string | null;
  notes: string | null;
  status: 'open' | 'closed' | 'archived';
  createdByUserId: string;
  createdAt: string;
  history: HistoryItem[];
}

interface CampaignResponse {
  data: Campaign;
}

interface ErrorResponse {
  message?: string;
}

const nextStatusMap: Record<'open' | 'closed' | 'archived', ('closed' | 'archived' | 'open')[]> = {
  open: ['closed'],
  closed: ['archived', 'open'],
  archived: ['open'],
};


function truncateLabel(name: string): string {
  return name.length > 40 ? `${name.slice(0, 40)}…` : name;
}
export default function CampaignDetailPage() {
  const { id } = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const companyId = searchParams.get('companyId') ?? '';
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState(0);
  const [createdCount, setCreatedCount] = useState<number | null>(null);
  const [activatedCount, setActivatedCount] = useState<number | null>(null);
  const [accessCodeLimit, setAccessCodeLimit] = useState<number | null>(null);
  const [confirmStatus, setConfirmStatus] = useState<'open' | 'closed' | 'archived' | null>(null);

  const fetchCampaign = useCallback(() => {
    if (!companyId) {
      setError('Missing companyId');
      setLoading(false);
      return;
    }
    setLoading(true);
    fetch(`${CORPORATE_API_BASE}/api/v1/corporate/campaigns/${id}?companyId=${encodeURIComponent(companyId)}`, { credentials: 'include' })
      .then(async (res) => {
        if (!res.ok) { const _errText = await res.text(); throw new Error(`Failed to load campaign (${res.status}): ${_errText}`); }
        const json = (await res.json()) as CampaignResponse;
        setCampaign(json.data);
      })
      .catch((err: unknown) => setError(err instanceof Error ? err.message : 'Failed to load'))
      .finally(() => setLoading(false));
  }, [id, companyId]);

  useEffect(() => {
    fetchCampaign();
  }, [fetchCampaign]);

  const changeStatus = async (newStatus: 'open' | 'closed' | 'archived') => {
    const res = await fetch(`${CORPORATE_API_BASE}/api/v1/corporate/campaigns/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ companyId, status: newStatus }),
      credentials: 'include',
    });
    if (!res.ok) {
      const err = (await res.json().catch(() => ({}))) as ErrorResponse;
      setError(err.message || 'Failed to update status');
      return;
    }
    setConfirmStatus(null);
    fetchCampaign();
  };

  const requestStatusChange = (newStatus: 'open' | 'closed' | 'archived') => {
    setError(null);
    setConfirmStatus(newStatus);
  };

  if (loading) return <Loading />;
  if (error) return <ErrorMessage message={error} />;
  if (!campaign) return <ErrorMessage message="Campaign not found" />;

  const nextStatuses = nextStatusMap[campaign.status];

  return (
    <div className="container mx-auto px-4 py-8">
      <Breadcrumbs
        items={[
          { label: 'Campaigns', href: `/campaigns?companyId=${encodeURIComponent(companyId)}` },
          { label: truncateLabel(campaign.name) },
        ]}
      />
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{campaign.name}</h1>
          <a href={`/campaigns/${campaign.id}/results?companyId=${companyId}`} className="text-sm text-blue-600 hover:underline">Results</a>
          <span className="ml-2 rounded-full px-2 py-1 text-xs font-medium uppercase">{campaign.status}</span>
        </div>
        <div className="flex gap-2">
          {nextStatuses.map((status) => (
            <Button key={status} onClick={() => requestStatusChange(status)} variant="secondary">
              Mark {status}
            </Button>
          ))}
        </div>
      </div>

      <Card className="mb-6">
        {campaign.description && <p className="mb-2 text-gray-700">{campaign.description}</p>}
        {campaign.notes && <p className="mb-2 text-gray-700"><strong>Notes:</strong> {campaign.notes}</p>}
        <p className="text-sm text-gray-500">Created {new Date(campaign.createdAt).toLocaleString()}</p>
      </Card>

      {accessCodeLimit !== null && (
        <div className="mb-4 text-sm text-gray-600">
          Access codes: {createdCount ?? 0} created
          {activatedCount !== null && (
            <>, {activatedCount} activated</>
          )}
          {accessCodeLimit !== -1 && activatedCount !== null && (
            <span className="ml-1">({Math.max(0, accessCodeLimit - activatedCount)} remaining)</span>
          )}
          {accessCodeLimit === -1 && <span className="ml-1">(unlimited)</span>}
        </div>
      )}

      {campaign.status === 'open' && (
        <CreateAccessCodeForm
          campaignId={campaign.id}
          companyId={companyId}
          onCreated={(count, activated, limit) => {
            setCreatedCount(count);
            setActivatedCount(activated);
            setAccessCodeLimit(limit);
            setRefreshToken((t) => t + 1);
          }}
        />
      )}

      {confirmStatus && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-w-sm rounded bg-white p-6 shadow-lg">
            <h3 className="mb-2 text-lg font-semibold">Confirm status change</h3>
            <p className="mb-4 text-sm text-gray-600">
              Are you sure you want to mark this campaign as <strong>{confirmStatus}</strong>?
              {confirmStatus !== 'open' && (
                <> This may disable access codes.</>
              )}
            </p>
            <div className="flex justify-end gap-2">
              <Button onClick={() => setConfirmStatus(null)} variant="secondary">Cancel</Button>
              <Button onClick={() => void changeStatus(confirmStatus)}>Confirm</Button>
            </div>
          </div>
        </div>
      )}

      <h2 className="mb-4 text-xl font-semibold">Access Codes</h2>
      <AccessCodeGrid
        campaignId={campaign.id}
        companyId={companyId}
        refreshToken={refreshToken}
        onSent={(activated, remaining) => {
          setActivatedCount(activated);
          if (remaining !== null && accessCodeLimit !== null && accessCodeLimit !== -1) {
            // no-op: remaining already derived
          }
        }}
      />

      <h2 className="mb-4 mt-8 text-xl font-semibold">History</h2>
      {campaign.history.length === 0 ? (
        <p className="text-gray-600">No history yet.</p>
      ) : (
        <ul className="space-y-2">
          {campaign.history.map((entry) => {
            const metadata = entry.metadata ? (JSON.parse(entry.metadata) as Record<string, unknown>) : {};
            const previousStatus = metadata.previousStatus ? String(metadata.previousStatus) : null;
            const recipientEmail = metadata.recipientEmail ? String(metadata.recipientEmail) : null;
            return (
              <li key={entry.id} className="rounded border p-3">
                <div className="flex items-center justify-between">
                  <span className="font-medium capitalize">{entry.action.replace(/_/g, ' ')}</span>
                  <span className="text-sm text-gray-500">{new Date(entry.changedAt).toLocaleString()}</span>
                </div>
                {entry.status && <p className="text-sm text-gray-600">Status: {entry.status}</p>}
                {previousStatus && (
                  <p className="text-sm text-gray-600">Previous status: {previousStatus}</p>
                )}
                {recipientEmail && (
                  <p className="text-sm text-gray-600">Sent to: {recipientEmail}</p>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
