'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { getTestSession, submitAnswer } from '../../../lib/test-engine.api';
import { ErrorMessage } from '../../../components/ui/ErrorMessage';

export default function TestSessionPage(): JSX.Element {
  const params = useParams();
  const sessionId = params.sessionId as string;
  const [state, setState] = useState<Awaited<ReturnType<typeof getTestSession>>['data'] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedAnswerId, setSelectedAnswerId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    getTestSession(sessionId)
      .then((response) => setState(response.data))
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load test'));
  }, [sessionId]);

  if (error) {
    return <ErrorMessage message={error} />;
  }

  if (!state) {
    return <p>Loading...</p>;
  }

  if (state.status === 'completed') {
    return (
      <section className="py-12 max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold">Test Complete</h1>
        <p className="text-lg mt-4">Your score: <strong>{state.score ?? 0}%</strong></p>
      </section>
    );
  }

  const question = state.questions[state.currentQuestionIndex];
  if (!question) {
    return <ErrorMessage message="No more questions" />;
  }

  function handleSubmit() {
    if (!selectedAnswerId) {
      return;
    }
    setIsSubmitting(true);
    submitAnswer(sessionId, { questionId: question.id, answerId: selectedAnswerId })
      .then((response) => {
        if (response.data.isComplete) {
          setState((prev) => (prev ? { ...prev, status: 'completed', score: response.data.currentScore } : prev));
        } else {
          void getTestSession(sessionId).then((r) => setState(r.data));
        }
        setSelectedAnswerId(null);
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to submit answer'))
      .finally(() => setIsSubmitting(false));
  }

  return (
    <section className="py-12 max-w-2xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-bold">Question {state.currentQuestionIndex + 1} of {state.questions.length}</h1>
      </div>
      <div className="border rounded p-4" dangerouslySetInnerHTML={{ __html: question.content }} />
      <div className="space-y-2">
        {question.answers.map((answer) => (
          <label key={answer.id} className="flex items-center gap-2 border rounded p-3 cursor-pointer">
            <input
              type="radio"
              name="answer"
              value={answer.id}
              checked={selectedAnswerId === answer.id}
              onChange={() => setSelectedAnswerId(answer.id)}
            />
            <span dangerouslySetInnerHTML={{ __html: answer.content }} />
          </label>
        ))}
      </div>
      <button
        onClick={handleSubmit}
        disabled={!selectedAnswerId || isSubmitting}
        className="w-full bg-blue-600 text-white rounded px-4 py-2 disabled:opacity-50"
      >
        {isSubmitting ? 'Submitting...' : 'Submit Answer'}
      </button>
    </section>
  );
}
