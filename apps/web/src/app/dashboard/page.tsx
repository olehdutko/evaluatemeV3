'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useAuth } from '../../lib/auth/auth-context';
import { getMyResults } from '../../lib/me.api';
import { PageHeader } from '../../components/ui/PageHeader';
import { ErrorMessage } from '../../components/ui/ErrorMessage';

interface ResultItem {
  resultCode: string;
  technologyId: string;
  technologyName: string;
  score: number | null;
  maxScore: number | null;
  status: string;
  createdAt: string;
}

export default function DashboardPage(): JSX.Element {
  const { user, isLoading: authLoading } = useAuth();
  const [results, setResults] = useState<ResultItem[]>([]);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    getMyResults()
      .then((response) => {
        if (!cancelled) setResults(response.data);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load results');
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  if (authLoading || user?.role !== 'user') {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <PageHeader title="Dashboard" description={authLoading ? 'Loading your dashboard…' : 'Dashboard is only available for personal accounts.'} />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <PageHeader title="Dashboard" description="Your test results and progress." />

      {isLoading ? (
        <p className="text-text-secondary font-body">Loading results…</p>
      ) : error ? (
        <ErrorMessage message={error} />
      ) : results.length === 0 ? (
        <p className="text-text-secondary font-body">No test results yet.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {results.map((result) => {
            const percentage = result.maxScore && result.maxScore > 0
              ? Math.round(((result.score || 0) / result.maxScore) * 100)
              : 0;
            return (
              <Link
                key={result.resultCode}
                href={`/dashboard/results/${encodeURIComponent(result.resultCode)}`}
                className="panel hover:bg-bg-secondary transition-colors group"
              >
                <div className="p-5 sm:p-6 space-y-3">
                  <p className="font-mono text-xs uppercase tracking-wider text-accent">{result.technologyName}</p>
                  <h2 className="font-display text-lg font-bold text-text-primary group-hover:text-accent transition-colors">
                    {result.status === 'completed' ? 'Completed test' : result.status}
                  </h2>
                  <div className="flex items-center justify-between">
                    <p className="font-mono text-sm text-text-secondary">
                      Score: <span className="text-text-primary font-medium">{result.score ?? 0}</span> / {result.maxScore ?? 0}
                    </p>
                    <p className="font-mono text-sm font-medium text-text-primary">{percentage}%</p>
                  </div>
                  <div className="w-full bg-bg-secondary rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full bg-accent transition-all" style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-mono text-xs text-text-muted">{new Date(result.createdAt).toLocaleString()}</p>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        void navigator.clipboard.writeText(result.resultCode).then(() => {
                          setCopiedCode(result.resultCode);
                          setTimeout(() => setCopiedCode((prev) => (prev === result.resultCode ? null : prev)), 1500);
                        });
                      }}
                      className="font-mono text-xs text-accent hover:text-text-primary underline-offset-2 decoration-1 hover:underline transition-colors"
                    >
                      {copiedCode === result.resultCode ? 'Copied!' : `Copy code: ${result.resultCode}`}
                    </button>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
