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
        <div className="grid gap-4">
          {campaigns.map((campaign) => (
            <Link key={campaign.id} href={`/campaigns/${campaign.id}?companyId=${localStorage.getItem('companyId') ?? ''}`}>
              <Card className="cursor-pointer hover:shadow-md">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold">{campaign.name}</h2>
                  <span className="rounded-full px-2 py-1 text-xs font-medium uppercase">{campaign.status}</span>
                </div>
                {campaign.description && <p className="mt-2 text-sm text-gray-600">{campaign.description}</p>}
                <p className="mt-2 text-xs text-gray-500">Created {new Date(campaign.createdAt).toLocaleDateString()}</p>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
