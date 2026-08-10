'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { startTest } from '../../../../lib/test-engine.api';
import { ErrorMessage } from '../../../../components/ui/ErrorMessage';

export default function StartTestPage(): JSX.Element {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const [error, setError] = useState<string | null>(null);
  const [isStarting, setIsStarting] = useState(false);

  function handleStart() {
    setError(null);
    setIsStarting(true);
    startTest({ technologySlug: slug })
      .then((response) => router.push(`/tests/${response.data.sessionId}`))
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to start test'))
      .finally(() => setIsStarting(false));
  }

  return (
    <section className="py-12 max-w-md mx-auto space-y-4">
      <h1 className="text-2xl font-bold">Start Test</h1>
      <p>Technology: <strong>{slug}</strong></p>
      {error && <ErrorMessage message={error} />}
      <button
        onClick={handleStart}
        disabled={isStarting}
        className="w-full bg-blue-600 text-white rounded px-4 py-2 disabled:opacity-50"
      >
        {isStarting ? 'Starting...' : 'Start Test'}
      </button>
    </section>
  );
}
