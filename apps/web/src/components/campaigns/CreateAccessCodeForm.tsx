'use client';

import { useEffect, useState } from 'react';
import { CORPORATE_API_BASE } from '../../lib/corporate-api';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { ErrorMessage } from '../ui/ErrorMessage';

interface QuizOption {
  id: string;
  name: string;
  type: string;
}

interface TechnologyOption {
  id: string;
  name: string;
}

interface CreateAccessCodeFormProps {
  campaignId: string;
  companyId: string;
  onCreated: () => void;
}

export function CreateAccessCodeForm({ campaignId, companyId, onCreated }: CreateAccessCodeFormProps) {
  const [quizzes, setQuizzes] = useState<QuizOption[]>([]);
  const [technologies, setTechnologies] = useState<TechnologyOption[]>([]);
  const [selectedQuiz, setSelectedQuiz] = useState('');
  const [quizType, setQuizType] = useState<'technology' | 'company_quiz'>('technology');
  const [selectedTechnology, setSelectedTechnology] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      fetch('/api/v1/technologies').then(async (res) => ((await res.json()) as { data: TechnologyOption[] }).data),
      fetch(`${CORPORATE_API_BASE}/api/v1/corporate/quizzes?companyId=${companyId}`, { credentials: 'include' }).then(async (res) => ((await res.json()) as { data: QuizOption[] }).data),
    ])
      .then(([techs, qs]) => {
        setTechnologies(techs);
        setQuizzes(qs);
      })
      .catch((err: unknown) => setError(err instanceof Error ? err.message : 'Failed to load quizzes'));
  }, [companyId]);

  const submit = async () => {
    setLoading(true);
    setError(null);
    const payload = {
      companyId,
      campaignId,
      quizId: selectedQuiz,
      quizType,
      technologyId: quizType === 'technology' ? selectedTechnology : null,
    };
    const res = await fetch(`${CORPORATE_API_BASE}/api/v1/corporate/campaigns/${campaignId}/access-codes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      credentials: 'include',
    });
    if (!res.ok) {
      const err = (await res.json().catch(() => ({}))) as { message?: string };
      setError(err.message || 'Failed to create access code');
    } else {
      onCreated();
    }
    setLoading(false);
  };

  return (
    <Card className="mb-6">
      {error && <ErrorMessage message={error} />}
      <div className="mb-4">
        <label className="block text-sm font-medium">Quiz source</label>
        <select
          value={quizType}
          onChange={(e) => setQuizType(e.target.value as typeof quizType)}
          className="w-full rounded border px-3 py-2"
        >
          <option value="technology">Global technology</option>
          <option value="company_quiz">Company quiz</option>
        </select>
      </div>

      {quizType === 'technology' ? (
        <div className="mb-4">
          <label className="block text-sm font-medium">Technology</label>
          <select
            value={selectedTechnology}
            onChange={(e) => {
              setSelectedTechnology(e.target.value);
              setSelectedQuiz(e.target.value);
            }}
            className="w-full rounded border px-3 py-2"
          >
            <option value="">-- select technology --</option>
            {technologies.map((t) => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
        </div>
      ) : (
        <div className="mb-4">
          <label className="block text-sm font-medium">Company quiz</label>
          <select
            value={selectedQuiz}
            onChange={(e) => setSelectedQuiz(e.target.value)}
            className="w-full rounded border px-3 py-2"
          >
            <option value="">-- select quiz --</option>
            {quizzes.map((q) => (
              <option key={q.id} value={q.id}>{q.name} ({q.type})</option>
            ))}
          </select>
        </div>
      )}

      <Button onClick={() => void submit()} disabled={!selectedQuiz || loading}>
        {loading ? 'Creating...' : 'Create Access Code'}
      </Button>
    </Card>
  );
}
