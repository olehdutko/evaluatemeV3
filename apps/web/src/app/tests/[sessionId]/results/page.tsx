'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { getTestSession } from '../../../../lib/test-engine.api';
import { ErrorMessage } from '../../../../components/ui/ErrorMessage';
import { Loading } from '../../../../components/ui/Loading';
import { PageHeader } from '../../../../components/ui/PageHeader';

export default function TestResultsPage(): JSX.Element {
  const params = useParams();
  const sessionId = params.sessionId as string;
  const [state, setState] = useState<Awaited<ReturnType<typeof getTestSession>>['data'] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadSession = useCallback(() => {
    getTestSession(sessionId)
      .then((response) => setState(response.data))
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load results'));
  }, [sessionId]);

  useEffect(() => {
    loadSession();
  }, [loadSession]);

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ErrorMessage message={error} onRetry={loadSession} />
      </div>
    );
  }

  if (!state) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Loading message="Loading results" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <PageHeader title="Test Complete" description="Your evaluation has been scored." />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="panel accent p-6 sm:p-8 text-center">
          <p className="label-mono">Your score</p>
          <p className="mt-4 font-display text-5xl sm:text-6xl font-bold text-text-primary">
            {state.score ?? 0}%
          </p>
        </div>

        <div className="lg:col-span-2 panel p-6 sm:p-8">
          <h2 className="font-display text-xl font-bold text-text-primary mb-4">Summary</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="label-mono">Status</p>
              <p className="font-body text-text-primary capitalize">{state.status}</p>
            </div>
            <div>
              <p className="label-mono">Session ID</p>
              <p className="font-mono text-sm text-text-secondary break-all">{sessionId}</p>
            </div>
            <div>
              <p className="label-mono">Questions</p>
              <p className="font-body text-text-primary">{state.questions.length}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 flex flex-col sm:flex-row gap-4">
        <Link href="/technologies" className="btn-primary text-center">
          Take another test
        </Link>
        <Link href="/" className="btn-secondary text-center">
          Go home
        </Link>
      </div>
    </div>
  );
}
