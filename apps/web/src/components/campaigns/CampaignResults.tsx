'use client';

import { useEffect, useState } from 'react';
import { CORPORATE_API_BASE } from '../../lib/corporate-api';
import Link from 'next/link';
import { Card } from '../ui/Card';

interface CandidateResult {
  id: string;
  resultCode: string;
  score: number | null;
  maxScore: number | null;
  status: string;
  createdAt: string;
}

interface CampaignResultsProps {
  campaignId: string;
  companyId: string;
}

export function CampaignResults({ campaignId, companyId }: CampaignResultsProps) {
  const [results, setResults] = useState<CandidateResult[]>([]);

  useEffect(() => {
    fetch(`${CORPORATE_API_BASE}/api/v1/corporate/campaigns/${campaignId}/results?companyId=${companyId}`, { credentials: 'include' })
      .then(async (res) => {
        if (!res.ok) { const _errText = await res.text(); throw new Error(`Failed to load results (${res.status}): ${_errText}`); }
        const json = (await res.json()) as { data: CandidateResult[] };
        setResults(json.data ?? []);
      })
      .catch(() => setResults([]));
  }, [campaignId, companyId]);

  if (results.length === 0) return <p className="text-gray-600">No results yet.</p>;

  return (
    <div className="grid gap-4">
      {results.map((result) => (
        <Link key={result.id} href={`/campaigns/${campaignId}/results/${result.resultCode}?companyId=${companyId}`}>
          <Card className="cursor-pointer hover:shadow-md">
            <div className="flex items-center justify-between">
              <span className="font-mono">{result.resultCode}</span>
              <span className="text-sm">{result.score ?? 0}/{result.maxScore ?? 100}</span>
            </div>
            <p className="text-xs text-gray-500">{new Date(result.createdAt).toLocaleString()}</p>
          </Card>
        </Link>
      ))}
    </div>
  );
}
