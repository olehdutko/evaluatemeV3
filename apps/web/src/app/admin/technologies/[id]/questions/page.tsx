'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { getTechnologyQuestions, saveQuestion } from '../../../../../lib/admin.api';
import { ErrorMessage } from '../../../../../components/ui/ErrorMessage';

interface AnswerInput {
  id?: string;
  content: string;
  isCorrect: boolean;
  orderIndex: number;
}

interface QuestionInput {
  id?: string;
  testId?: string;
  content: string;
  type: 'single' | 'multiple';
  orderIndex: number;
  score: number;
  answers: AnswerInput[];
}

interface QuestionDetail extends QuestionInput {
  id: string;
}

interface TestDetail {
  id: string;
  title: string;
  status: string;
  durationMinutes: number | null;
  passingScore: number | null;
  questions: QuestionDetail[];
}

interface TechnologyDetail {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  tests: TestDetail[];
}

const emptyQuestion = (testId: string): QuestionInput => ({
  testId,
  content: '',
  type: 'single',
  orderIndex: 1,
  score: 1,
  answers: [
    { content: '', isCorrect: true, orderIndex: 1 },
    { content: '', isCorrect: false, orderIndex: 2 },
  ],
});

export default function AdminTechnologyQuestionsPage(): JSX.Element {
  const params = useParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const [technology, setTechnology] = useState<TechnologyDetail | null>(null);
  const [selectedTestId, setSelectedTestId] = useState<string | null>(null);
  const [form, setForm] = useState<QuestionInput | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    getTechnologyQuestions(id)
      .then((response) => {
        setTechnology(response.data);
        if (response.data.tests.length > 0) {
          setSelectedTestId(response.data.tests[0].id);
        }
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load technology'))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (selectedTestId) {
      setForm(emptyQuestion(selectedTestId));
    }
  }, [selectedTestId]);

  function addAnswer() {
    setForm((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        answers: [...prev.answers, { content: '', isCorrect: false, orderIndex: prev.answers.length + 1 }],
      };
    });
  }

  function updateAnswer(index: number, patch: Partial<AnswerInput>) {
    setForm((prev) => {
      if (!prev) return null;
      const answers = prev.answers.map((a, i) => (i === index ? { ...a, ...patch } : a));
      return { ...prev, answers };
    });
  }

  function removeAnswer(index: number) {
    setForm((prev) => {
      if (!prev) return null;
      return { ...prev, answers: prev.answers.filter((_, i) => i !== index) };
    });
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!form || !form.testId) return;
    setSaving(true);
    setError(null);
    const payload = {
      id: form.id,
      testId: form.testId,
      content: form.content,
      type: form.type,
      orderIndex: form.orderIndex,
      score: form.score,
      answers: form.answers,
    };
    saveQuestion(payload)
      .then(() => {
        if (!id || !form.testId) return;
        const testId = form.testId;
        return getTechnologyQuestions(id).then((response) => {
          setTechnology(response.data);
          setForm(emptyQuestion(testId));
        });
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to save question'))
      .finally(() => setSaving(false));
  }

  if (loading) return <p className="p-8 text-text-secondary font-body">Loading…</p>;
  if (!technology) return <ErrorMessage message={error || 'Technology not found'} className="m-6" />;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <header className="mb-10 border-b border-border pb-6">
        <p className="font-mono text-xs uppercase tracking-[0.12em] text-accent mb-3">Content · {technology.name}</p>
        <h1 className="font-display text-3xl sm:text-4xl font-bold text-text-primary">Questions</h1>
      </header>

      {error && <ErrorMessage message={error} className="mb-6" />}

      <div className="grid lg:grid-cols-2 gap-8">
        <section>
          <h2 className="font-display text-xl font-bold text-text-primary mb-4">Existing Questions</h2>
          {technology.tests.length === 0 ? (
            <p className="text-text-secondary font-body">No tests for this technology yet.</p>
          ) : (
            <div className="space-y-6">
              {technology.tests.map((test) => (
                <div key={test.id} className="panel p-5">
                  <h3 className="font-display font-bold text-text-primary mb-3">{test.title}</h3>
                  {test.questions.length === 0 ? (
                    <p className="text-text-secondary font-body text-sm">No questions yet.</p>
                  ) : (
                    <ul className="space-y-3">
                      {test.questions.map((q) => (
                        <li key={q.id} className="border-b border-border last:border-0 pb-3">
                          <p className="font-body text-text-primary">{q.orderIndex}. {q.content}</p>
                          <ul className="mt-2 space-y-1">
                            {q.answers.map((a) => (
                              <li
                                key={a.id || a.orderIndex}
                                className={`font-mono text-xs ${a.isCorrect ? 'text-success' : 'text-text-secondary'}`}
                              >
                                {a.isCorrect ? '✓ ' : '○ '}{a.content}
                              </li>
                            ))}
                          </ul>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-text-primary mb-4">Add Question</h2>
          {technology.tests.length === 0 ? (
            <p className="text-text-secondary font-body">Create a test for this technology before adding questions.</p>
          ) : (
            <form onSubmit={handleSubmit} className="panel p-6 space-y-5">
              <label className="block">
                <span className="label-mono">Test</span>
                <select
                  value={selectedTestId ?? ''}
                  onChange={(e) => setSelectedTestId(e.target.value)}
                  className="input-field"
                >
                  {technology.tests.map((test) => (
                    <option key={test.id} value={test.id}>{test.title}</option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="label-mono">Question</span>
                <textarea
                  value={form?.content ?? ''}
                  onChange={(e) => setForm((prev) => (prev ? { ...prev, content: e.target.value } : null))}
                  required
                  rows={3}
                  className="input-field"
                />
              </label>

              <div className="grid sm:grid-cols-3 gap-4">
                <label className="block">
                  <span className="label-mono">Type</span>
                  <select
                    value={form?.type ?? 'single'}
                    onChange={(e) => setForm((prev) => (prev ? { ...prev, type: e.target.value as 'single' | 'multiple' } : null))}
                    className="input-field"
                  >
                    <option value="single">Single choice</option>
                    <option value="multiple">Multiple choice</option>
                  </select>
                </label>
                <label className="block">
                  <span className="label-mono">Order</span>
                  <input
                    type="number"
                    min={0}
                    value={form?.orderIndex ?? 1}
                    onChange={(e) => setForm((prev) => (prev ? { ...prev, orderIndex: parseInt(e.target.value, 10) || 0 } : null))}
                    className="input-field"
                  />
                </label>
                <label className="block">
                  <span className="label-mono">Score</span>
                  <input
                    type="number"
                    min={1}
                    value={form?.score ?? 1}
                    onChange={(e) => setForm((prev) => (prev ? { ...prev, score: parseInt(e.target.value, 10) || 1 } : null))}
                    className="input-field"
                  />
                </label>
              </div>

              <div className="space-y-3">
                <p className="label-mono">Answers</p>
                {form?.answers.map((answer, index) => (
                  <div key={index} className="flex gap-3 items-start">
                    <input
                      type="text"
                      value={answer.content}
                      onChange={(e) => updateAnswer(index, { content: e.target.value })}
                      placeholder={`Answer ${index + 1}`}
                      required
                      className="input-field flex-1"
                    />
                    <label className="flex items-center gap-2 pt-3">
                      <input
                        type="checkbox"
                        checked={answer.isCorrect}
                        onChange={(e) => updateAnswer(index, { isCorrect: e.target.checked })}
                        className="h-5 w-5 accent-accent"
                      />
                      <span className="text-sm font-mono text-text-secondary">Correct</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => removeAnswer(index)}
                      disabled={form.answers.length <= 2}
                      className="text-error font-mono text-sm px-2 disabled:opacity-50"
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addAnswer}
                  className="btn-secondary text-sm py-2 px-4"
                >
                  Add Answer
                </button>
              </div>

              <button type="submit" disabled={saving} className="btn-primary disabled:opacity-50">
                {saving ? 'Saving…' : 'Save Question'}
              </button>
            </form>
          )}
        </section>
      </div>
    </div>
  );
}
