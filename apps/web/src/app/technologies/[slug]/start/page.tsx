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

  const { isAuthenticated, isAdmin: isAdminUser, isCompany, isUser: isPersonalUser } = useAuth();
  const selectedQuestionSet = preview.questionSets.find((qs) => qs.id === selectedQuestionSetId) ?? preview.questionSets[0];

  const pageDescription = ((): string => {
    if (isAdminUser) {
      return 'Admin accounts cannot take tests. Use the admin panel to configure the application.';
    }
    if (isCompany) {
      return 'Corporate accounts cannot take tests directly. Create a campaign to invite participants.';
    }
    if (isPersonalUser) {
      return 'Select a question set and review the quiz details before you start.';
    }
    return 'Read-only technology details. Log in or register to start a test.';
  })();

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
        description={pageDescription}
        borderless={isCompany || isPersonalUser}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className={`space-y-6 ${isCompany || isPersonalUser ? 'lg:col-span-3' : 'lg:col-span-2'}`}>
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
                          : 'border-border bg-bg-primary'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
                            <div className="min-w-0">
                              <h3 className="font-display text-lg font-bold text-text-primary">{questionSet.title}</h3>
                            </div>
                            <div className="text-left sm:text-right shrink-0">
                              <p className="font-mono text-xs text-text-secondary">
                                {questionSet.questionCount} questions / {questionSet.durationMinutes} min
                              </p>
                              <p className="font-mono text-[10px] text-text-muted">
                                {questionSet.actualQuestionCount.toLocaleString()} available
                              </p>
                            </div>
                          </div>
                        </div>
                        {isPersonalUser && (
                          <div
                            className="shrink-0"
                            onClick={(event) => { event.stopPropagation(); }}
                            role="presentation"
                          >
                            <QuizStartButtonWithDialog
                              slug={preview.slug}
                              questionSetId={questionSet.id}
                              variant="primary"
                              className="w-full sm:w-auto"
                              initialPreview={preview}
                            />
                          </div>
                        )}
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
                <p className="text-xs text-text-muted mt-1">
                  {selectedQuestionSet?.actualQuestionCount.toLocaleString() ?? 0} available
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

        {(!isAuthenticated || isAdminUser) && (
          <div className="panel p-6 sm:p-8 h-fit space-y-4">
            <p className="label-mono">Slug</p>
            <p className="font-mono text-sm text-text-secondary">{preview.slug}</p>

            {!isAuthenticated ? (
              <div className="pt-4 border-t border-border">
                <p className="text-sm text-text-secondary font-body">
                  Want to test your skills? Create an account or log in to start a quiz.
                </p>
                <div className="flex flex-col gap-3 mt-4">
                  <Link href="/register" className="btn-primary text-center">Sign up</Link>
                  <Link href="/login" className="btn-secondary text-center">Log in</Link>
                </div>
              </div>
            ) : (
              <div className="pt-4 border-t border-border">
                <p className="text-sm text-text-secondary font-body">
                  Admin accounts cannot take tests. Switch to a personal account to start a quiz.
                </p>
                <div className="flex flex-col gap-3 mt-4">
                  <Link href="/admin/dashboard" className="btn-secondary text-center">Go to admin panel</Link>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
