'use client';

import { useEffect, useState } from 'react';
import { CORPORATE_API_BASE } from '../../lib/corporate-api';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { ErrorMessage } from '../../components/ui/ErrorMessage';
import { Loading } from '../../components/ui/Loading';

interface Campaign {
  id: string;
  name: string;
  description: string | null;
  status: 'open' | 'closed' | 'archived';
  createdAt: string;
  updatedAt: string;
  accessCodeCount: number;
}

interface CampaignsResponse {
  data: Campaign[];
}

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [status, setStatus] = useState<'' | 'open' | 'closed' | 'archived'>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const companyId = localStorage.getItem('companyId');
    if (!companyId) {
      setLoading(false);
      setError('No company profile selected. Please log in as a company user.');
      return;
    }
    const params = new URLSearchParams({ companyId });
    if (status) params.set('status', status);
    fetch(`${CORPORATE_API_BASE}/api/v1/corporate/campaigns?${params.toString()}`, { credentials: 'include' })
      .then(async (res) => {
        if (!res.ok) {
          const errText = await res.text();
          throw new Error(`Failed to load campaigns (${res.status}): ${errText}`);
        }
        const json = (await res.json()) as CampaignsResponse;
        setCampaigns(json.data ?? []);
      })
      .catch((err: unknown) => setError(err instanceof Error ? err.message : 'Failed to load'))
      .finally(() => setLoading(false));
  }, [status]);

  if (loading) return <Loading />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Campaigns</h1>
        <Button onClick={() => router.push('/campaigns/new')}>New Campaign</Button>
      </div>

      <div className="mb-4">
        <label className="mr-2 text-sm font-medium">Filter by status:</label>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as typeof status)}
          className="rounded border border-gray-300 px-2 py-1"
        >
          <option value="">All</option>
          <option value="open">Open</option>
          <option value="closed">Closed</option>
          <option value="archived">Archived</option>
        </select>
      </div>

      {campaigns.length === 0 ? (
        <p className="text-gray-600">No campaigns found.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {campaigns.map((campaign) => {
            const isClosed = campaign.status === 'closed';
            const isArchived = campaign.status === 'archived';
            const isInactive = isClosed || isArchived;
            const cardClasses = isInactive
              ? 'border border-gray-300 bg-gray-100 text-gray-600'
              : 'border border-gray-200 bg-white';
            const statusClasses = isClosed
              ? 'bg-red-100 text-red-800 ring-1 ring-red-300'
              : isArchived
                ? 'bg-gray-300 text-gray-700 ring-1 ring-gray-400'
                : 'bg-emerald-100 text-emerald-800';
            return (
              <Link
                key={campaign.id}
                href={`/campaigns/${campaign.id}?companyId=${localStorage.getItem('companyId') ?? ''}`}
                className={isInactive ? 'opacity-90' : ''}
              >
                <Card className={`cursor-pointer hover:shadow-md ${cardClasses}`}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h2 className="truncate text-lg font-semibold">{campaign.name}</h2>
                        <span className="shrink-0 text-xs text-gray-500">
                          ({campaign.accessCodeCount} {campaign.accessCodeCount === 1 ? 'code' : 'codes'})
                        </span>
                      </div>
                      {campaign.description && (
                        <p className="mt-1 line-clamp-2 text-sm text-gray-600">{campaign.description}</p>
                      )}
                    </div>
                    <span
                      className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-bold uppercase tracking-wide ${statusClasses}`}
                    >
                      {campaign.status}
                    </span>
                  </div>
                  <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
                    <span>Created {new Date(campaign.createdAt).toLocaleDateString()}</span>
                    {isClosed ? (
                      <span className="font-medium text-amber-700">Closed {new Date(campaign.updatedAt).toLocaleDateString()}</span>
                    ) : isArchived ? (
                      <span className="font-medium text-gray-600">Archived {new Date(campaign.updatedAt).toLocaleDateString()}</span>
                    ) : null}
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
