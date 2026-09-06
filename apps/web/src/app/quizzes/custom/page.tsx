'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { ErrorMessage } from '../../../components/ui/ErrorMessage';
import { Loading } from '../../../components/ui/Loading';

interface Technology {
  id: string;
  name: string;
  slug: string;
}

interface Question {
  id: string;
  content: string;
  technologyId: string;
}

interface TechnologiesResponse {
  data: Technology[];
}

interface QuestionsResponse {
  data: Question[];
}

export default function CustomQuizBuilderPage() {
  const router = useRouter();
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [technologies, setTechnologies] = useState<Technology[]>([]);
  const [selectedTech, setSelectedTech] = useState<string>('');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedQuestions, setSelectedQuestions] = useState<Set<string>>(new Set());
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const cid = localStorage.getItem('companyId');
    setCompanyId(cid);
    fetch('/api/v1/technologies')
      .then(async (res) => {
        if (!res.ok) throw new Error('Failed to load technologies');
        const json = (await res.json()) as TechnologiesResponse;
        setTechnologies(json.data ?? []);
      })
      .catch((err: unknown) => setError(err instanceof Error ? err.message : 'Failed to load'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!selectedTech) return;
    fetch(`/api/v1/admin/technologies/${selectedTech}/questions`)
      .then(async (res) => {
        if (!res.ok) throw new Error('Failed to load questions');
        const json = (await res.json()) as QuestionsResponse;
        setQuestions(json.data ?? []);
      })
      .catch((err: unknown) => setError(err instanceof Error ? err.message : 'Failed to load questions'));
  }, [selectedTech]);

  const toggleQuestion = (id: string) => {
    setSelectedQuestions((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const submit = async () => {
    if (!companyId) {
      setError('No company profile selected');
      return;
    }
    const res = await fetch('/api/v1/corporate/quizzes/custom', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        companyId,
        name,
        description,
        questionIds: Array.from(selectedQuestions),
      }),
    });
    if (!res.ok) {
      const err = (await res.json().catch(() => ({}))) as { message?: string };
      setError(err.message || 'Failed to create quiz');
      return;
    }
    router.push('/campaigns');
  };

  if (loading) return <Loading />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold">Create Custom Quiz</h1>
      <Card className="mb-6">
        <div className="mb-4">
          <label className="block text-sm font-medium">Name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded border px-3 py-2"
            placeholder="Quiz name"
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full rounded border px-3 py-2"
            rows={3}
          />
        </div>
      </Card>

      <Card className="mb-6">
        <label className="block text-sm font-medium">Select Technology</label>
        <select
          value={selectedTech}
          onChange={(e) => setSelectedTech(e.target.value)}
          className="w-full rounded border px-3 py-2"
        >
          <option value="">-- choose technology --</option>
          {technologies.map((t) => (
            <option key={t.id} value={t.id}>{t.name}</option>
          ))}
        </select>
      </Card>

      {questions.length > 0 && (
        <Card className="mb-6">
          <h2 className="mb-4 text-lg font-semibold">Questions ({selectedQuestions.size} selected)</h2>
          <div className="space-y-2">
            {questions.map((q) => (
              <label key={q.id} className="flex items-start gap-2 rounded border p-3">
                <input
                  type="checkbox"
                  checked={selectedQuestions.has(q.id)}
                  onChange={() => toggleQuestion(q.id)}
                />
                <span className="text-sm">{q.content}</span>
              </label>
            ))}
          </div>
        </Card>
      )}

      <Button onClick={() => void submit()} disabled={selectedQuestions.size === 0 || !name}>Create Quiz</Button>
    </div>
  );
}
