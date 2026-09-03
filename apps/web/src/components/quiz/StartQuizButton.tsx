'use client';

import { useState } from 'react';
import { useAuth } from '../../lib/auth/auth-context';
import { startPersonalQuiz } from '../../lib/test-engine.api';
import { ErrorMessage } from '../ui/ErrorMessage';
import { BuyCreditsPrompt } from './BuyCreditsPrompt';
import { ApiError } from '../../lib/api-client';

export function StartQuizButton(): JSX.Element | null {
  const { user, refreshUser } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<{ price: number; remainingCredits: number } | null>(null);
  const [needsCredits, setNeedsCredits] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  if (user?.role !== 'user') {
    return null;
  }

  async function handleClick(): Promise<void> {
    setError(null);
    setSuccess(null);
    setNeedsCredits(false);
    setIsLoading(true);
    try {
      const response = await startPersonalQuiz();
      setSuccess({ price: response.data.price, remainingCredits: response.data.remainingCredits });
      await refreshUser();
    } catch (err) {
      if (err instanceof ApiError && err.status === 402) {
        setNeedsCredits(true);
      } else {
        setError(err instanceof Error ? err.message : 'Failed to start quiz');
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      <div className="space-y-3">
        <button
          type="button"
          onClick={() => { void handleClick(); }}
          disabled={isLoading}
          className="w-full btn-primary text-center disabled:opacity-50"
        >
          {isLoading ? 'Starting…' : 'Start quiz'}
        </button>
        {!needsCredits && error && <ErrorMessage message={error} />}
        {success && (
          <p className="font-mono text-xs text-success">
            {success.price === 0 ? 'Free quiz reserved.' : `Quiz reserved (-${success.price} credits).`} Remaining: {success.remainingCredits} credits.
          </p>
        )}
      </div>
      <BuyCreditsPrompt
        open={needsCredits}
        onClose={() => setNeedsCredits(false)}
        message={error ?? undefined}
      />
    </>
  );
}
