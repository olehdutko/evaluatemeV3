'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { fetchTechnologyPreview } from '../../../../lib/technology.api';
import { PageHeader } from '../../../../components/ui/PageHeader';
import { ErrorMessage } from '../../../../components/ui/ErrorMessage';
import { Loading } from '../../../../components/ui/Loading';
import { QuizStartButtonWithDialog } from '../../../../components/quiz/QuizStartButtonWithDialog';
import { useAuth } from '../../../../lib/auth/auth-context';

export default function TechnologyDetailPage(): JSX.Element {
  const params = useParams();
  const slug = params.slug as string;
  const { user } = useAuth();

  const [preview, setPreview] = useState<Awaited<ReturnType<typeof fetchTechnologyPreview>>['data'] | null>(null);
  const [selectedQuestionSetId, setSelectedQuestionSetId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(null);
    fetchTechnologyPreview(slug)
      .then((response) => {
        if (!cancelled) {
          setPreview(response.data);
          setSelectedQuestionSetId(response.data.questionSets[0]?.id ?? null);
        }
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Unable to load preview.');
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => { cancelled = true; };
  }, [slug]);

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
  const isAdminUser = user?.role === 'admin';
  const selectedQuestionSet = preview.questionSets.find((qs) => qs.id === selectedQuestionSetId) ?? preview.questionSets[0];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <nav aria-label="Breadcrumb" className="mb-4">
        <ol className="flex items-center gap-2 text-sm font-body text-text-secondary">
          <li>
            <Link href="/technologies" className="hover:text-accent transition-colors">
              Technologies
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <Link href={`/technologies/${preview.slug}/start`} className="hover:text-accent transition-colors">
              {preview.name}
            </Link>
          </li>
          {selectedQuestionSet && (
            <>
              <li aria-hidden="true">/</li>
              <li className="text-text-primary" aria-current="page">
                {selectedQuestionSet.title}
              </li>
            </>
          )}
        </ol>
      </nav>

      <PageHeader
        title={preview.name}
        description={
          isAdminUser
            ? 'Admin accounts cannot take tests. Use the admin panel to configure the application.'
            : isPersonalUser
              ? 'Select a question set and review the quiz details before you start.'
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
              Available question sets
            </h2>
            {selectedQuestionSet?.description && (
              <p className="mt-3 text-text-secondary font-body">
                {selectedQuestionSet.description}
              </p>
            )}
            {preview.questionSets.length === 0 ? (
              <p className="mt-4 text-text-secondary font-body">No question sets available for this technology.</p>
            ) : (
              <div className="mt-4 grid gap-4">
                {preview.questionSets.map((questionSet) => {
                  const isSelected = questionSet.id === selectedQuestionSetId;
                  return (
                    <button
                      key={questionSet.id}
                      type="button"
                      onClick={() => setSelectedQuestionSetId(questionSet.id)}
                      className={`text-left p-4 border transition-colors ${
                        isSelected
                          ? 'border-border-strong bg-bg-secondary'
                          : 'border-border bg-bg-primary hover:bg-bg-secondary'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <h3 className="font-display text-lg font-bold text-text-primary">{questionSet.title}</h3>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="font-mono text-xs text-text-secondary">
                            {questionSet.questionCount} questions / {questionSet.durationMinutes} min
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="panel p-6 sm:p-8">
            <h2 className="font-display text-xl sm:text-2xl font-bold text-text-primary">
              Quiz details
            </h2>
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 bg-bg-secondary rounded">
                <p className="label-mono">Questions</p>
                <p className="font-display text-2xl font-bold text-text-primary">
                  {selectedQuestionSet?.questionCount ?? 0}
                </p>
              </div>
              <div className="p-4 bg-bg-secondary rounded">
                <p className="label-mono">Time limit</p>
                <p className="font-display text-2xl font-bold text-text-primary">
                  {selectedQuestionSet?.durationMinutes ?? 0} min
                </p>
              </div>
              <div className="p-4 bg-bg-secondary rounded">
                <p className="label-mono">Price</p>
                <p className="font-display text-2xl font-bold text-text-primary">
                  {preview.price} credits
                </p>
              </div>
            </div>
          </div>
        </div>

          <div className="panel p-6 sm:p-8 h-fit space-y-4">
          <p className="label-mono">Slug</p>
          <p className="font-mono text-sm text-text-secondary">{preview.slug}</p>

          {isAdminUser ? (
            <div className="pt-4 border-t border-border">
              <p className="text-sm text-text-secondary font-body">
                Admin accounts cannot take tests. Switch to a personal account to start a quiz.
              </p>
              <div className="flex flex-col gap-3 mt-4">
                <Link href="/admin/dashboard" className="btn-secondary text-center">Go to admin panel</Link>
              </div>
            </div>
          ) : isPersonalUser ? (
            <div className="space-y-3 pt-4 border-t border-border">
              <QuizStartButtonWithDialog
                slug={preview.slug}
                questionSetId={selectedQuestionSetId ?? ''}
                variant="primary"
                className="w-full"
                initialPreview={preview}
              />
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
    </div>
  );
}
