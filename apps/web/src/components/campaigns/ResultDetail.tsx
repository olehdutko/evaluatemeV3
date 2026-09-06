'use client';

import { useEffect, useState } from 'react';
import { CORPORATE_API_BASE } from '../../lib/corporate-api';
import { Card } from '../ui/Card';
import { Loading } from '../ui/Loading';
import { ErrorMessage } from '../ui/ErrorMessage';

interface QuestionResult {
  questionId: string;
  answerId: string | null;
  isCorrect: boolean;
}

interface CandidateResultDetail {
  id: string;
  resultCode: string;
  score: number | null;
  maxScore: number | null;
  status: string;
  questions: QuestionResult[];
  createdAt: string;
}

interface ResultDetailProps {
  campaignId: string;
  resultId: string;
  companyId: string;
}

export function ResultDetail({ campaignId, resultId, companyId }: ResultDetailProps) {
  const [result, setResult] = useState<CandidateResultDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${CORPORATE_API_BASE}/api/v1/corporate/campaigns/${campaignId}/results/${resultId}?companyId=${companyId}`, { credentials: 'include' })
      .then(async (res) => {
        if (!res.ok) { const _errText = await res.text(); throw new Error(`Failed to load result (${res.status}): ${_errText}`); }
        const json = (await res.json()) as { data: CandidateResultDetail };
        setResult(json.data);
      })
      .catch((err: unknown) => setError(err instanceof Error ? err.message : 'Failed to load'))
      .finally(() => setLoading(false));
  }, [campaignId, resultId, companyId]);

  if (loading) return <Loading />;
  if (error) return <ErrorMessage message={error} />;
  if (!result) return <ErrorMessage message="Result not found" />;

  const correct = result.questions.filter((q) => q.isCorrect).length;
  const total = result.questions.length;

  return (
    <div>
      <Card className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Result {result.resultCode}</h1>
            <p className="text-sm text-gray-500">{new Date(result.createdAt).toLocaleString()}</p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold">{result.score ?? 0}%</p>
            <p className="text-sm text-gray-600">{correct}/{total} correct</p>
          </div>
        </div>
      </Card>

      <h2 className="mb-4 text-xl font-semibold">Per-question breakdown</h2>
      {result.questions.length === 0 ? (
        <p className="text-gray-600">No question data available.</p>
      ) : (
        <ul className="space-y-2">
          {result.questions.map((q, index) => (
            <li key={q.questionId} className={`rounded border p-3 ${q.isCorrect ? 'border-green-300 bg-green-50' : 'border-red-300 bg-red-50'}`}>
              <span className="font-medium">Question {index + 1}</span>
              <span className="ml-2 text-sm">{q.isCorrect ? 'Correct' : 'Incorrect'}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
