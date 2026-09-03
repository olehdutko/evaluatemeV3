'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { fetchTechnologyPreview } from '../../../../lib/technology.api';
import { startPersonalQuiz, startTest } from '../../../../lib/test-engine.api';
import { PageHeader } from '../../../../components/ui/PageHeader';
import { ErrorMessage } from '../../../../components/ui/ErrorMessage';
import { Loading } from '../../../../components/ui/Loading';
import { Modal } from '../../../../components/ui/Modal';
import { StartQuizButton } from '../../../../components/quiz/StartQuizButton';
import { useAuth } from '../../../../lib/auth/auth-context';
import { ApiError } from '../../../../lib/api-client';

export default function TechnologyDetailPage(): JSX.Element {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const { user, refreshUser } = useAuth();

  const [preview, setPreview] = useState<Awaited<ReturnType<typeof fetchTechnologyPreview>>['data'] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [startError, setStartError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(null);
    fetchTechnologyPreview(slug)
      .then((response) => {
        if (!cancelled) setPreview(response.data);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Unable to load preview.');
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => { cancelled = true; };
  }, [slug]);

  async function handleConfirmStart(): Promise<void> {
    setStartError(null);
    setIsStarting(true);
    try {
      await startPersonalQuiz();
      const session = await startTest({ technologySlug: slug });
      await refreshUser();
      router.push(`/tests/${session.data.sessionId}`);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to start quiz';
      setStartError(message);
      if (err instanceof ApiError && err.status === 402) {
        // Insufficient credits after confirmation: close confirm and show error inline.
        setShowConfirm(false);
      }
    } finally {
      setIsStarting(false);
    }
  }

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Loading message="Loading technology preview…" />
      </div>
    );
  }

  if (error || !preview) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <PageHeader title="Technology" description="Unable to load technology details." />
        {error && <ErrorMessage message={error} />}
      </div>
    );
  }

  const isPersonalUser = user?.role === 'user';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <PageHeader
        title={preview.name}
        description={
          isPersonalUser
            ? 'Review the sample question and quiz details before you start.'
            : 'Read-only technology details. Log in or register to start a test.'
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="panel accent p-6 sm:p-8">
            <h2 className="font-display text-xl sm:text-2xl font-bold text-text-primary">
              About this technology
            </h2>
            <p className="mt-4 font-body text-text-secondary">
              {preview.description || 'No description available.'}
            </p>
          </div>

          <div className="panel p-6 sm:p-8">
            <h2 className="font-display text-xl sm:text-2xl font-bold text-text-primary">
              Quiz details
            </h2>
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 bg-bg-secondary rounded">
                <p className="label-mono">Questions</p>
                <p className="font-display text-2xl font-bold text-text-primary">{preview.questionCount}</p>
              </div>
              <div className="p-4 bg-bg-secondary rounded">
                <p className="label-mono">Time limit</p>
                <p className="font-display text-2xl font-bold text-text-primary">{preview.durationMinutes} min</p>
              </div>
              <div className="p-4 bg-bg-secondary rounded">
                <p className="label-mono">Price</p>
                <p className="font-display text-2xl font-bold text-text-primary">{preview.price} credits</p>
              </div>
            </div>
          </div>

          <div className="panel p-6 sm:p-8">
            <h2 className="font-display text-xl sm:text-2xl font-bold text-text-primary">
              Sample question
            </h2>
            {preview.sampleQuestion ? (
              <div className="mt-4 space-y-4">
                <div
                  className="prose prose-sm sm:prose-base max-w-none font-body text-text-primary"
                  dangerouslySetInnerHTML={{ __html: preview.sampleQuestion.content }}
                />
                <div className="space-y-2">
                  {preview.sampleQuestion.answers.map((answer, index) => (
                    <div
                      key={answer.id}
                      className="flex items-start gap-3 p-3 border border-border bg-bg-primary"
                    >
                      <span className="font-mono text-xs text-text-muted w-6">{String.fromCharCode(65 + index)}.</span>
                      <span
                        className="font-body text-text-secondary"
                        dangerouslySetInnerHTML={{ __html: answer.content }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="mt-4 text-text-secondary font-body">No sample question available.</p>
            )}
          </div>
        </div>

        <div className="panel p-6 sm:p-8 h-fit space-y-4">
          <p className="label-mono">Slug</p>
          <p className="font-mono text-sm text-text-secondary">{preview.slug}</p>

          {isPersonalUser ? (
            <div className="space-y-3 pt-4 border-t border-border">
              <StartQuizButton
                onClick={() => setShowConfirm(true)}
                isLoading={isStarting}
              />
              {startError && <ErrorMessage message={startError} />}
            </div>
          ) : (
            <div className="pt-4 border-t border-border">
              <p className="text-sm text-text-secondary font-body">
                Want to test your skills? Create an account or log in to start a quiz.
              </p>
              <div className="flex flex-col gap-3 mt-4">
                <Link href="/register" className="btn-primary text-center">Sign up</Link>
                <Link href="/login" className="btn-secondary text-center">Log in</Link>
              </div>
            </div>
          )}
        </div>
      </div>

      <Modal
        open={showConfirm}
        onClose={() => !isStarting && setShowConfirm(false)}
        title="Start quiz?"
      >
        <div className="space-y-4">
          <p className="font-body text-text-primary">
            Once you click "Yes" button, {preview.price} credits will be taken from your account for selected test. Do you really want to navigate to test?
          </p>
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShowConfirm(false)}
              disabled={isStarting}
              className="btn-secondary flex-1 disabled:opacity-50"
            >
              No
            </button>
            <button
              type="button"
              onClick={() => { void handleConfirmStart(); }}
              disabled={isStarting}
              className="btn-primary flex-1 disabled:opacity-50"
            >
              {isStarting ? 'Starting…' : 'Yes'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
