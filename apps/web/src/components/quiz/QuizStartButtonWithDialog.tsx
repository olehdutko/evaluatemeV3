'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { fetchTechnologyPreview } from '../../lib/technology.api';
import { startPersonalQuiz, startTest } from '../../lib/test-engine.api';
import { useAuth } from '../../lib/auth/auth-context';
import { ApiError } from '../../lib/api-client';
import { Modal } from '../ui/Modal';
import { ErrorMessage } from '../ui/ErrorMessage';

interface QuizStartButtonWithDialogProps {
  slug: string;
  variant?: 'primary' | 'secondary';
  className?: string;
  initialPreview?: Awaited<ReturnType<typeof fetchTechnologyPreview>>['data'] | null;
}

export function QuizStartButtonWithDialog({
  slug,
  variant = 'primary',
  className = '',
  initialPreview = null,
}: QuizStartButtonWithDialogProps): JSX.Element | null {
  const { user, refreshUser } = useAuth();
  const router = useRouter();

  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [preview, setPreview] = useState<Awaited<ReturnType<typeof fetchTechnologyPreview>>['data'] | null>(initialPreview);
  const [error, setError] = useState<string | null>(null);

  if (user?.role !== 'user') {
    return null;
  }

  async function handleOpenConfirm(): Promise<void> {
    setError(null);
    if (preview) {
      setShowConfirm(true);
      return;
    }
    setIsLoading(true);
    try {
      const response = await fetchTechnologyPreview(slug);
      setPreview(response.data);
      setShowConfirm(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load quiz preview.');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleConfirmStart(): Promise<void> {
    if (!preview) return;
    setError(null);
    setIsLoading(true);
    try {
      await startPersonalQuiz();
      const session = await startTest({ technologySlug: slug });
      await refreshUser();
      router.push(`/tests/${session.data.sessionId}`);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to start quiz';
      setError(message);
      if (err instanceof ApiError && err.status === 402) {
        setShowConfirm(false);
      }
    } finally {
      setIsLoading(false);
    }
  }

  const baseClass = variant === 'primary' ? 'btn-primary' : 'btn-secondary';

  return (
    <>
      <button
        type="button"
        onClick={() => { void handleOpenConfirm(); }}
        disabled={isLoading}
        className={`${baseClass} ${className} disabled:opacity-50`.trim()}
      >
        {isLoading && !showConfirm ? 'Loading…' : 'Start quiz'}
      </button>

      {error && !showConfirm && <ErrorMessage message={error} />}

      <Modal
        open={showConfirm}
        onClose={() => !isLoading && setShowConfirm(false)}
        title="Start quiz?"
      >
        <div className="space-y-4">
          {preview ? (
            <>
              <p className="font-body text-text-primary">
                Once you click "Yes" button, {preview.price} credits will be taken from your account for selected test. Do you really want to navigate to test?
              </p>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="p-3 bg-bg-secondary rounded">
                  <span className="label-mono">Questions</span>
                  <p className="font-display text-lg font-bold">{preview.questionCount}</p>
                </div>
                <div className="p-3 bg-bg-secondary rounded">
                  <span className="label-mono">Time</span>
                  <p className="font-display text-lg font-bold">{preview.durationMinutes} min</p>
                </div>
              </div>
            </>
          ) : (
            <p className="font-body text-text-secondary">Loading preview…</p>
          )}

          {error && showConfirm && <ErrorMessage message={error} />}

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShowConfirm(false)}
              disabled={isLoading}
              className="btn-secondary flex-1 disabled:opacity-50"
            >
              No
            </button>
            <button
              type="button"
              onClick={() => { void handleConfirmStart(); }}
              disabled={isLoading || !preview}
              className="btn-primary flex-1 disabled:opacity-50"
            >
              {isLoading ? 'Starting…' : 'Yes'}
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}
