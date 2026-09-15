'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { ErrorMessage } from '../../../components/ui/ErrorMessage';
import { Loading } from '../../../components/ui/Loading';
import { Button } from '../../../components/ui/Button';
import { CORPORATE_API_BASE } from '../../../lib/corporate-api';
import { CreateAccessCodeForm } from '../../../components/campaigns/CreateAccessCodeForm';
import { AccessCodeGrid } from '../../../components/campaigns/AccessCodeGrid';
import { CampaignResults } from '../../../components/campaigns/CampaignResults';
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
  const [activeTab, setActiveTab] = useState<'access-codes' | 'results' | 'history'>('access-codes');
  const [confirmStatus, setConfirmStatus] = useState<'open' | 'closed' | 'archived' | null>(null);
  const [historyPage, setHistoryPage] = useState(1);
  const [historyPageSize, setHistoryPageSize] = useState<number | 'all'>(15);

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
        </div>
        <div className="flex gap-2">
          {campaign.status === 'open' && (
            <Button onClick={() => requestStatusChange('closed')} variant="secondary">
              Close
            </Button>
          )}
          {campaign.status !== 'open' && (
            <Button onClick={() => requestStatusChange('open')} variant="secondary">
              Reopen
            </Button>
          )}
        </div>
      </div>

      <div className="mb-6">
        {campaign.description && <p className="mb-2 text-gray-700">{campaign.description}</p>}
        {campaign.notes && <p className="text-gray-700"><strong>Notes:</strong> {campaign.notes}</p>}
      </div>

      <div className="mb-6 border-b border-border">
        <nav className="-mb-px flex gap-6" aria-label="Campaign tabs">
          {[
            { id: 'access-codes', label: 'Access Codes' },
            { id: 'results', label: 'Results' },
            { id: 'history', label: 'History' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`border-b-2 px-1 pb-2 font-mono text-sm uppercase tracking-wider transition-colors ${
                activeTab === tab.id
                  ? 'border-text-primary text-text-primary'
                  : 'border-transparent text-text-secondary hover:text-text-primary'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {activeTab === 'access-codes' && (
        <div className="space-y-6">
          {campaign.status === 'open' && (
            <CreateAccessCodeForm
              campaignId={campaign.id}
              companyId={companyId}
              onCreated={() => {
                setRefreshToken((t) => t + 1);
              }}
            />
          )}
          <AccessCodeGrid
            campaignId={campaign.id}
            companyId={companyId}
            refreshToken={refreshToken}
          />
        </div>
      )}

      {activeTab === 'results' && (
        <CampaignResults campaignId={campaign.id} companyId={companyId} />
      )}

      {activeTab === 'history' && (
        <>
          {campaign.history.length === 0 ? (
            <p className="text-gray-600">No history yet.</p>
          ) : (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-3">
                  <label htmlFor="history-page-size" className="font-mono text-xs uppercase tracking-wider text-text-secondary">
                    Per page
                  </label>
                  <select
                    id="history-page-size"
                    value={historyPageSize}
                    onChange={(e) => {
                      setHistoryPageSize(e.target.value === 'all' ? 'all' : Number(e.target.value));
                      setHistoryPage(1);
                    }}
                    className="input-field py-1.5 pr-8 text-sm"
                  >
                    <option value={15}>15</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                    <option value="all">All</option>
                  </select>
                </div>
                <p className="font-mono text-xs text-text-secondary">
                  {historyPageSize === 'all'
                    ? `Showing all ${campaign.history.length} entries`
                    : `Page ${historyPage} of ${Math.max(1, Math.ceil(campaign.history.length / historyPageSize))}`}
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-bg-tertiary">
                    <tr>
                      <th className="px-4 py-2 font-mono text-xs uppercase tracking-wider text-text-secondary">Action</th>
                      <th className="px-4 py-2 font-mono text-xs uppercase tracking-wider text-text-secondary">Details</th>
                      <th className="px-4 py-2 font-mono text-xs uppercase tracking-wider text-text-secondary">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {(historyPageSize === 'all'
                      ? campaign.history
                      : campaign.history.slice((historyPage - 1) * historyPageSize, historyPage * historyPageSize)
                    ).map((entry) => {
                      const metadata = entry.metadata ? (JSON.parse(entry.metadata) as Record<string, unknown>) : {};
                      const previousStatus = metadata.previousStatus ? String(metadata.previousStatus) : null;
                      const recipientEmail = metadata.recipientEmail ? String(metadata.recipientEmail) : null;
                      const testeeEmail = metadata.testeeEmail ? String(metadata.testeeEmail) : null;
                      const testeeName = metadata.testeeName ? String(metadata.testeeName) : null;
                      const code = metadata.code ? String(metadata.code) : null;
                      const details: string[] = [];
                      if (entry.status) details.push(`Status: ${entry.status}`);
                      if (previousStatus) details.push(`From: ${previousStatus}`);
                      if (recipientEmail) details.push(`Sent to: ${recipientEmail}`);
                      if (code) details.push(`Code: ${code}`);
                      if (testeeEmail) details.push(`For: ${testeeEmail}`);
                      if (testeeName) details.push(`Testee: ${testeeName}`);
                      return (
                        <tr key={entry.id}>
                          <td className="px-4 py-2 font-medium capitalize text-text-primary">{entry.action.replace(/_/g, ' ')}</td>
                          <td className="px-4 py-2 text-text-secondary">{details.join(' · ') || '-'}</td>
                          <td className="px-4 py-2 text-text-secondary whitespace-nowrap">{new Date(entry.changedAt).toLocaleString()}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {historyPageSize !== 'all' && campaign.history.length > historyPageSize && (
                <div className="flex items-center justify-center gap-2">
                  {Array.from({ length: Math.ceil(campaign.history.length / historyPageSize) }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      type="button"
                      onClick={() => setHistoryPage(page)}
                      className={`min-w-[2rem] px-2 py-1 text-sm font-mono border transition-colors ${
                        historyPage === page
                          ? 'border-text-primary bg-text-primary text-bg-primary'
                          : 'border-border text-text-secondary hover:border-text-primary hover:text-text-primary'
                      }`}
                      aria-label={`Go to page ${page}`}
                      aria-current={historyPage === page ? 'page' : undefined}
                    >
                      {page}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}

      {confirmStatus && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-w-sm rounded bg-white p-6 shadow-lg">
            <h3 className="mb-2 text-lg font-semibold">
              {confirmStatus === 'closed' ? 'Close campaign?' : 'Reopen campaign?'}
            </h3>
            <p className="mb-4 text-sm text-gray-600">
              {confirmStatus === 'closed' ? (
                <>
                  Are you sure you want to close this campaign? This will prevent creating and sending new access codes. Already sent codes remain active.
                </>
              ) : (
                <>
                  Are you sure you want to reopen this campaign? You will be able to create and send new access codes.
                </>
              )}
            </p>
            <div className="flex justify-end gap-2">
              <Button onClick={() => setConfirmStatus(null)} variant="secondary">Cancel</Button>
              <Button onClick={() => void changeStatus(confirmStatus)}>
                {confirmStatus === 'closed' ? 'Close' : 'Reopen'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
