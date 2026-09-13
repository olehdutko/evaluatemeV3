'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ErrorMessage } from '../../../components/ui/ErrorMessage';
import { PageHeader } from '../../../components/ui/PageHeader';
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
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-5">
      <PageHeader title="New Campaign" description="Create a campaign to organize your assessments and access codes." />

      <section className="panel p-5 sm:p-6">
        <h2 className="font-display text-lg font-bold text-text-primary mb-4">Campaign details</h2>
        <form onSubmit={(e) => { void handleSubmit(e); }} className="space-y-4">
          <label className="block">
            <span className="label-mono">Name</span>
            <input
              id="name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={255}
              className="input-field py-2"
              placeholder="e.g. Senior JS hiring Q3 2026"
            />
          </label>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="label-mono">Description</span>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="input-field min-h-[72px] py-2"
                rows={2}
                placeholder="Short description"
              />
            </label>

            <label className="block">
              <span className="label-mono">Notes</span>
              <textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="input-field min-h-[72px] py-2"
                rows={2}
                placeholder="Internal notes (optional)"
              />
            </label>
          </div>

          {error && <ErrorMessage message={error} />}

          <div className="flex items-center justify-end pt-1">
            <button type="submit" disabled={loading || !name.trim()} className="btn-primary">
              {loading ? 'Creating…' : 'Create Campaign'}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
