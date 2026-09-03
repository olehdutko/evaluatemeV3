'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { getMyResultDetail } from '../../../../lib/me.api';
import { PageHeader } from '../../../../components/ui/PageHeader';
import { ErrorMessage } from '../../../../components/ui/ErrorMessage';

interface QuestionDetail {
  questionId: string;
  content: string;
  type: string;
  score: number;
  userAnswerId: string;
  userAnswerContent: string;
  correctAnswerIds: string[];
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

function DonutChart({ correct, incorrect, total }: { correct: number; incorrect: number; total: number }): JSX.Element {
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const correctPct = total > 0 ? correct / total : 0;
  const incorrectPct = total > 0 ? incorrect / total : 0;
  const correctOffset = circumference * (1 - correctPct);
  const incorrectOffset = circumference * (1 - incorrectPct);

  return (
    <div className="flex items-center gap-6">
      <svg viewBox="0 0 100 100" className="w-32 h-32 shrink-0 -rotate-90">
        <circle cx="50" cy="50" r={radius} fill="none" stroke="currentColor" strokeWidth="12" className="text-bg-secondary" />
        <circle
          cx="50" cy="50" r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="12"
          strokeDasharray={circumference}
          strokeDashoffset={correctOffset}
          className="text-success" strokeLinecap="round"
        />
        <circle
          cx="50" cy="50" r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="12"
          strokeDasharray={circumference}
          strokeDashoffset={incorrectOffset}
          className="text-error" strokeLinecap="round"
          style={{ transform: `rotate(${correctPct * 360}deg)`, transformOrigin: '50% 50%' }}
        />
      </svg>
      <div className="space-y-1">
        <p className="font-mono text-sm text-text-secondary">Correct: <span className="text-success font-medium">{correct}</span></p>
        <p className="font-mono text-sm text-text-secondary">Incorrect: <span className="text-error font-medium">{incorrect}</span></p>
        <p className="font-mono text-sm text-text-secondary">Total: <span className="text-text-primary font-medium">{total}</span></p>
      </div>
    </div>
  );
}

function ScoreBar({ score, maxScore }: { score: number; maxScore: number }): JSX.Element {
  const pct = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="font-body text-text-primary font-medium">Overall score</p>
        <p className="font-mono text-xl font-bold text-text-primary">{pct}%</p>
      </div>
      <div className="w-full bg-bg-secondary rounded-full h-3 overflow-hidden">
        <div className="h-full bg-accent transition-all" style={{ width: `${pct}%` }} />
      </div>
      <p className="font-mono text-sm text-text-secondary">{score} / {maxScore} points</p>
    </div>
  );
}

export default function ResultDetailPage(): JSX.Element {
  const { resultCode } = useParams();
  const [detail, setDetail] = useState<ResultDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    if (typeof resultCode !== 'string') {
      setError('Invalid result code');
      setIsLoading(false);
      return;
    }
    getMyResultDetail(resultCode)
      .then((response) => {
        if (!cancelled) setDetail(response.data);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load result');
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => { cancelled = true; };
  }, [resultCode]);

  const correctCount = detail?.questions.filter((q) => q.isCorrect).length ?? 0;
  const incorrectCount = detail?.questions.length ?? 0 - correctCount;
  const totalQuestions = detail?.questions.length ?? 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link href="/dashboard" className="font-mono text-sm text-accent hover:text-text-primary">← Back to Dashboard</Link>

      {isLoading ? (
        <p className="mt-4 text-text-secondary font-body">Loading result…</p>
      ) : error ? (
        <div className="mt-4"><ErrorMessage message={error} /></div>
      ) : !detail ? null : (
        <>
          <PageHeader
            title={`${detail.technologyName} result`}
            description={`Completed on ${new Date(detail.createdAt).toLocaleString()}`}
          />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="panel p-6">
              <ScoreBar score={detail.score ?? 0} maxScore={detail.maxScore ?? 0} />
            </div>
            <div className="panel p-6">
              <DonutChart correct={correctCount} incorrect={incorrectCount} total={totalQuestions} />
            </div>
          </div>

          <h2 className="font-display text-xl font-bold text-text-primary mb-4">Question breakdown</h2>
          <div className="space-y-4">
            {detail.questions.map((q, index) => (
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
                  <p className="text-sm text-text-secondary">Your answer: <span className="text-text-primary font-medium">{q.userAnswerContent}</span></p>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
