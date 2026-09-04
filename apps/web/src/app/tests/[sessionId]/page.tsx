'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getTestSession, submitAnswer } from '../../../lib/test-engine.api';
import { ErrorMessage } from '../../../components/ui/ErrorMessage';
import { Loading } from '../../../components/ui/Loading';
import { Button } from '../../../components/ui/Button';

export default function TestSessionPage(): JSX.Element {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.sessionId as string;
  const [state, setState] = useState<Awaited<ReturnType<typeof getTestSession>>['data'] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedAnswerId, setSelectedAnswerId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);

  const loadSession = useCallback(() => {
    getTestSession(sessionId)
      .then((response) => setState(response.data))
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load test'));
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
        <Loading message="Loading test session" />
      </div>
    );
  }

  if (state.status === 'completed') {
    router.push(`/tests/${sessionId}/results`);
    return <></>;
  }

  const totalQuestions = state.questions.length;
  const current = state.currentQuestionIndex + 1;
  const question = state.questions[state.currentQuestionIndex];
  const durationMinutes = state.durationMinutes ?? Math.max(1, totalQuestions * 2);

  if (!hasStarted) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        <div className="panel accent p-6 sm:p-8 lg:p-10 text-center space-y-6">
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-text-primary">
            Ready to start?
          </h1>
          <p className="font-body text-text-secondary max-w-prose mx-auto">
            Once you click "Let's start" button, a timer will be started. You have to answer {totalQuestions} questions in {durationMinutes} minutes.
          </p>
          <Button variant="primary" onClick={() => setHasStarted(true)} className="w-full sm:w-auto">
            Let&apos;s start
          </Button>
        </div>
      </div>
    );
  }

  if (!question) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ErrorMessage message="No more questions" />
      </div>
    );
  }

  function handleSubmit() {
    if (!selectedAnswerId) {
      return;
    }
    setError(null);
    setIsSubmitting(true);
    submitAnswer(sessionId, { questionId: question.id, answerId: selectedAnswerId })
      .then((response) => {
        if (response.data.isComplete) {
          router.push(`/tests/${sessionId}/results`);
        } else {
          setSelectedAnswerId(null);
          loadSession();
        }
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to submit answer'))
      .finally(() => setIsSubmitting(false));
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <p className="font-mono text-xs uppercase tracking-[0.12em] text-text-muted">
          Question {String(current).padStart(2, '0')} of {String(totalQuestions).padStart(2, '0')}
        </p>
        <div className="flex gap-1 h-2 w-full sm:w-64">
          {Array.from({ length: totalQuestions }).map((_, index) => {
            const questionId = state.questions[index]?.id;
            const userAnswer = questionId
              ? state.userAnswers?.find((a) => a.questionId === questionId)
              : undefined;
            const color = userAnswer
              ? userAnswer.isCorrect
                ? 'bg-success'
                : 'bg-error'
              : index < current
                ? 'bg-info'
                : 'bg-bg-tertiary';
            return (
              <div
                key={index}
                className={`flex-1 transition-colors duration-300 ${color}`}
                title={userAnswer ? (userAnswer.isCorrect ? 'Correct' : 'Incorrect') : index < current ? 'Current question' : 'Pending'}
              />
            );
          })}
        </div>
      </div>

      <div className="panel accent p-6 sm:p-8 lg:p-10 mb-6">
        <div className="flex items-start gap-3">
          <span className="font-mono text-accent text-lg">Q.</span>
          <div
            className="prose prose-sm sm:prose-base max-w-none font-body text-text-primary"
            dangerouslySetInnerHTML={{ __html: question.content }}
          />
        </div>
      </div>

      <div className="space-y-3">
        {question.answers.map((answer) => (
          <button
            key={answer.id}
            type="button"
            onClick={() => setSelectedAnswerId(answer.id)}
            className={`w-full text-left p-4 sm:p-5 border transition-all duration-150 font-body ${
              selectedAnswerId === answer.id
                ? 'border-accent bg-accent-soft'
                : 'border-border bg-bg-primary hover:border-border-strong hover:bg-bg-secondary'
            }`}
            aria-pressed={selectedAnswerId === answer.id}
          >
            <div className="flex items-start gap-3">
              <span
                className={`mt-0.5 w-5 h-5 shrink-0 border flex items-center justify-center transition-colors ${
                  selectedAnswerId === answer.id ? 'border-accent bg-accent text-white' : 'border-text-muted'
                }`}
              >
                {selectedAnswerId === answer.id && <span className="text-xs">✓</span>}
              </span>
              <span dangerouslySetInnerHTML={{ __html: answer.content }} />
            </div>
          </button>
        ))}
      </div>

      {error && (
        <div className="mt-6">
          <ErrorMessage message={error} />
        </div>
      )}

      <div className="mt-8 flex flex-col sm:flex-row sm:justify-end">
        <Button
          variant="primary"
          onClick={handleSubmit}
          disabled={!selectedAnswerId || isSubmitting}
          className="w-full sm:w-auto"
        >
          {isSubmitting ? 'Submitting…' : current === totalQuestions ? 'Finish Test' : 'Submit Answer'}
        </Button>
      </div>
    </div>
  );
}
