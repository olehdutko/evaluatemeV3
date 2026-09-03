'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { PageHeader } from '../../components/ui/PageHeader';
import { ErrorMessage } from '../../components/ui/ErrorMessage';
import { getPublicResult } from '../../lib/public-result.api';

interface QuestionDetail {
  questionId: string;
  content: string;
  type: string;
  score: number;
  userAnswerContent: string;
  isCorrect: boolean;
}

interface ResultDetail {
  resultCode: string;
  technologyId: string;
  technologyName: string;
  score: number | null;
  maxScore: number | null;
  status: string;
  createdAt: string;
  questions: QuestionDetail[];
}

function ResultView(): JSX.Element {
  const searchParams = useSearchParams();
  const initialCode = searchParams.get('code') || '';
  const [code, setCode] = useState(initialCode);
  const [result, setResult] = useState<ResultDetail | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!initialCode) return;
    setCode(initialCode);
    setError(null);
    setIsLoading(true);
    getPublicResult(initialCode)
      .then((response) => { setResult(response.data); })
      .catch((err) => { setError(err instanceof Error ? err.message : 'Failed to load result'); })
      .finally(() => { setIsLoading(false); });
  }, [initialCode]);

  async function handleLookup(): Promise<void> {
    const trimmed = code.trim();
    if (!trimmed) return;
    setIsLoading(true);
    setError(null);
    setResult(null);
    try {
      const response = await getPublicResult(trimmed);
      setResult(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load result');
    } finally {
      setIsLoading(false);
    }
  }

  const correctCount = result?.questions.filter((q) => q.isCorrect).length ?? 0;
  const totalQuestions = result?.questions.length ?? 0;
  const percentage = result?.maxScore && result.maxScore > 0
    ? Math.round(((result.score || 0) / result.maxScore) * 100)
    : 0;

  return (
    <div className="max-w-3xl mx-auto">
      <div className="panel accent p-6 sm:p-8 space-y-5">
        <label htmlFor="result-code" className="label-mono">Result code</label>
        <div className="flex gap-3">
          <input
            id="result-code"
            type="text"
            value={code}
            onChange={(e) => { setCode(e.target.value); }}
            placeholder="Enter result code" // e.g. USR-...
            className="input-field flex-1"
          />
          <button
            type="button"
            onClick={() => { void handleLookup(); }}
            disabled={isLoading || code.trim().length === 0}
            className="btn-primary disabled:opacity-50"
          >
            {isLoading ? 'Loading…' : 'View result'}
          </button>
        </div>
        {error && <ErrorMessage message={error} />}
      </div>

      {result && (
        <div className="mt-8 space-y-6">
          <div className="panel p-6 sm:p-8 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <p className="font-mono text-xs uppercase tracking-wider text-accent">{result.technologyName}</p>
                <h2 className="font-display text-2xl font-bold text-text-primary">Quiz result</h2>
              </div>
              <div className="text-left sm:text-right">
                <p className="font-display text-3xl font-bold text-text-primary">{percentage}%</p>
                <p className="font-mono text-sm text-text-secondary">{result.score ?? 0} / {result.maxScore ?? 0} points</p>
              </div>
            </div>
            <div className="w-full bg-bg-secondary rounded-full h-3 overflow-hidden">
              <div className="h-full bg-accent" style={{ width: `${percentage}%` }} />
            </div>
            <p className="font-mono text-xs text-text-muted">Completed on {new Date(result.createdAt).toLocaleString()}</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="panel p-4 text-center">
              <p className="font-mono text-xs text-text-secondary">Correct</p>
              <p className="font-display text-2xl font-bold text-success">{correctCount}</p>
            </div>
            <div className="panel p-4 text-center">
              <p className="font-mono text-xs text-text-secondary">Incorrect</p>
              <p className="font-display text-2xl font-bold text-error">{totalQuestions - correctCount}</p>
            </div>
            <div className="panel p-4 text-center">
              <p className="font-mono text-xs text-text-secondary">Total</p>
              <p className="font-display text-2xl font-bold text-text-primary">{totalQuestions}</p>
            </div>
            <div className="panel p-4 text-center">
              <p className="font-mono text-xs text-text-secondary">Result code</p>
              <p className="font-mono text-sm font-bold text-text-primary truncate">{result.resultCode}</p>
            </div>
          </div>

          <h2 className="font-display text-xl font-bold text-text-primary">Question breakdown</h2>
          <div className="space-y-4">
            {result.questions.map((q, index) => (
              <div key={q.questionId} className={`panel p-5 border-l-4 ${q.isCorrect ? 'border-l-success' : 'border-l-error'}`}>
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="font-mono text-xs text-text-muted mb-1">Question {index + 1} · {q.score} pts</p>
                    <p className="font-body text-text-primary">{q.content}</p>
                  </div>
                  <span className={`font-mono text-xs uppercase tracking-wider px-2 py-1 rounded ${q.isCorrect ? 'bg-success/10 text-success' : 'bg-error/10 text-error'}`}>
                    {q.isCorrect ? 'Correct' : 'Incorrect'}
                  </span>
                </div>
                <div className="mt-3 pt-3 border-t border-border">
                  <p className="text-sm text-text-secondary">Answer: <span className="text-text-primary font-medium">{q.userAnswerContent}</span></p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function ResultPage(): JSX.Element {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <PageHeader
        title="Quiz result lookup"
        description="Enter a Result Code to view the quiz result." />
      <Suspense fallback={<p className="text-text-secondary">Loading…</p>}>
        <ResultView />
      </Suspense>
    </div>
  );
}
