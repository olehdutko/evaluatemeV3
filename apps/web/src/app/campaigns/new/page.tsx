'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { ErrorMessage } from '../../../components/ui/ErrorMessage';
import { CORPORATE_API_BASE } from '../../../lib/corporate-api';

export default function NewCampaignPage(): JSX.Element {
  const router = useRouter();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const companyId = typeof window !== 'undefined' ? window.localStorage.getItem('companyId') : null;
    if (!companyId) {
      setError('No company profile selected. Please log in as a company user.');
      setLoading(false);
      return;
    }
    try {
      const res = await fetch(`${CORPORATE_API_BASE}/api/v1/corporate/campaigns`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyId, name, description, notes }),
        credentials: 'include',
      });
      if (!res.ok) {
        const err = (await res.json().catch(() => ({}))) as { message?: string };
        throw new Error(err.message || `Failed to create campaign (${res.status})`);
      }
      const json = (await res.json()) as { data: { id: string } };
      router.push(`/campaigns/${json.data.id}?companyId=${encodeURIComponent(companyId)}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create campaign');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold">New Campaign</h1>
      <Card className="max-w-xl">
        {error && <ErrorMessage message={error} />}
        <form onSubmit={(e) => { void handleSubmit(e); }} className="space-y-4">
          <div>
            <label className="block text-sm font-medium" htmlFor="name">Name</label>
            <input
              id="name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded border px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium" htmlFor="description">Description</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded border px-3 py-2"
              rows={3}
            />
          </div>
          <div>
            <label className="block text-sm font-medium" htmlFor="notes">Notes</label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full rounded border px-3 py-2"
              rows={3}
            />
          </div>
          <Button type="submit" disabled={loading || !name.trim()}>
            {loading ? 'Creating...' : 'Create Campaign'}
          </Button>
        </form>
      </Card>
    </div>
  );
}
