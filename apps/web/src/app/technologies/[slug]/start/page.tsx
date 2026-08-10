'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { startTest } from '../../../../lib/test-engine.api';
import { ErrorMessage } from '../../../../components/ui/ErrorMessage';
import { PageHeader } from '../../../../components/ui/PageHeader';

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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <PageHeader
        title="Start Test"
        description={`Prepare for the ${slug} evaluation.`}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="panel accent p-6 sm:p-8">
            <h2 className="font-display text-xl sm:text-2xl font-bold text-text-primary">
              What to expect
            </h2>
            <ul className="mt-4 space-y-3 font-body text-text-secondary">
              <li className="flex gap-3">
                <span className="font-mono text-accent">01.</span>
                You will answer up to 20 questions selected for this technology.
              </li>
              <li className="flex gap-3">
                <span className="font-mono text-accent">02.</span>
                Each question has one correct answer. Choose carefully.
              </li>
              <li className="flex gap-3">
                <span className="font-mono text-accent">03.</span>
                Your final score is the percentage of correct answers.
              </li>
            </ul>
          </div>

          {error && <ErrorMessage message={error} onRetry={handleStart} />}
        </div>

        <div className="panel p-6 sm:p-8 h-fit">
          <p className="label-mono">Technology</p>
          <p className="font-display text-2xl sm:text-3xl font-bold text-text-primary capitalize">{slug}</p>

          <button
            onClick={handleStart}
            disabled={isStarting}
            className="btn-primary w-full mt-8"
          >
            {isStarting ? 'Starting…' : 'Start Test'}
          </button>
        </div>
      </div>
    </div>
  );
}
