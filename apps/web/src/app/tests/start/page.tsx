'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { startSessionByAccessCode } from '../../../lib/test-engine.api';
import { ErrorMessage } from '../../../components/ui/ErrorMessage';
import { Loading } from '../../../components/ui/Loading';

function StartByAccessCode(): JSX.Element {
  const searchParams = useSearchParams();
  const router = useRouter();
  const accessCode = searchParams.get('accessCode');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!accessCode) {
      setError('Access code is required to start the test.');
      return;
    }

    startSessionByAccessCode(accessCode)
      .then((response) => {
        router.replace(`/tests/${response.data.sessionId}`);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Failed to start test');
      });
  }, [accessCode, router]);

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <ErrorMessage message={error} />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Loading message="Starting your assessment…" />
    </div>
  );
}

export default function StartByAccessCodePage(): JSX.Element {
  return (
    <Suspense fallback={<div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12"><Loading message="Starting your assessment…" /></div>}>
      <StartByAccessCode />
    </Suspense>
  );
}
