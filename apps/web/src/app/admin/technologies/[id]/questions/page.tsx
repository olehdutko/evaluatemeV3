'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { getTechnologyQuestions, saveQuestion, deleteQuestion, deleteAnswer } from '../../../../../lib/admin.api';
import { ErrorMessage } from '../../../../../components/ui/ErrorMessage';

interface AnswerInput {
  id?: string;
  content: string;
  isCorrect: boolean;
  orderIndex: number;
}

interface QuestionInput {
  id?: string;
  technologyId: string;
  content: string;
  type: 'single' | 'multiple';
  orderIndex: number;
  score: number;
  answers: AnswerInput[];
}

interface QuestionDetail {
  id: string;
  content: string;
  type: 'single' | 'multiple';
  orderIndex: number;
  score: number;
  answers: AnswerInput[];
}

interface TechnologyDetail {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  questions: QuestionDetail[];
}

const emptyQuestion = (technologyId: string): QuestionInput => ({
  technologyId,
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
  const [form, setForm] = useState<QuestionInput | null>(null);
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingQuestionId, setDeletingQuestionId] = useState<string | null>(null);
  const [deletingAnswerId, setDeletingAnswerId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    loadTechnology(id);
  }, [id]);

  function loadTechnology(technologyId: string) {
    setLoading(true);
    getTechnologyQuestions(technologyId)
      .then((response) => {
        setTechnology(response.data);
        if (!form) {
          setForm(emptyQuestion(technologyId));
        }
        setError(null);
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load questions'))
      .finally(() => setLoading(false));
  }

  function startEdit(question: QuestionDetail) {
    setEditingQuestionId(question.id);
    setForm({
      id: question.id,
      technologyId: id ?? '',
      content: question.content,
      type: question.type,
      orderIndex: question.orderIndex,
      score: question.score,
      answers: question.answers.map((a) => ({ ...a })),
    });
    setFormError(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function resetForm() {
    setEditingQuestionId(null);
    if (id) {
      setForm(emptyQuestion(id));
    }
    setFormError(null);
  }

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
      if (prev.type === 'single' && patch.isCorrect) {
        answers.forEach((a, i) => {
          if (i !== index) a.isCorrect = false;
        });
      }
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
    if (!form || !form.technologyId) return;

    if (form.answers.filter((a) => a.isCorrect).length === 0) {
      setFormError('At least one answer must be marked correct.');
      return;
    }
    if (form.type === 'single' && form.answers.filter((a) => a.isCorrect).length !== 1) {
      setFormError('Single-choice questions must have exactly one correct answer.');
      return;
    }

    setSaving(true);
    setFormError(null);
    const payload = {
      id: form.id,
      technologyId: form.technologyId,
      content: form.content,
      type: form.type,
      orderIndex: form.orderIndex,
      score: form.score,
      answers: form.answers,
    };
    saveQuestion(payload)
      .then(() => {
        if (!id) return;
        return getTechnologyQuestions(id).then((response) => {
          setTechnology(response.data);
          resetForm();
        });
      })
      .catch((err) => setFormError(err instanceof Error ? err.message : 'Failed to save question'))
      .finally(() => setSaving(false));
  }

  function handleDeleteQuestion(questionId: string) {
    if (!confirm('Are you sure you want to delete this question?')) return;
    setDeletingQuestionId(questionId);
    deleteQuestion(questionId)
      .then(() => {
        if (!id) return;
        return getTechnologyQuestions(id).then((response) => {
          setTechnology(response.data);
          if (editingQuestionId === questionId) {
            resetForm();
          }
        });
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to delete question'))
      .finally(() => setDeletingQuestionId(null));
  }

  function handleDeleteAnswer(answerId: string, questionId: string) {
    if (!confirm('Are you sure you want to delete this answer?')) return;
    setDeletingAnswerId(answerId);
    deleteAnswer(answerId)
      .then(() => {
        if (!id) return;
        return getTechnologyQuestions(id).then((response) => {
          setTechnology(response.data);
          if (editingQuestionId === questionId && form) {
            setForm({
              ...form,
              answers: form.answers.filter((a) => a.id !== answerId),
            });
          }
        });
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to delete answer'))
      .finally(() => setDeletingAnswerId(null));
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
          {technology.questions.length === 0 ? (
            <p className="text-text-secondary font-body">No questions for this technology yet.</p>
          ) : (
            <ul className="panel divide-y divide-border">
              {technology.questions.map((q) => (
                <li key={q.id} className="px-5 py-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="font-body text-text-primary font-bold">
                        {q.orderIndex}. {q.content}
                      </p>
                      <p className="text-text-secondary font-mono text-xs mt-1">
                        {q.type === 'single' ? 'Single choice' : 'Multiple choice'} · {q.score} point{q.score !== 1 ? 's' : ''}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => startEdit(q)}
                        className="btn-secondary text-sm py-2 px-3"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteQuestion(q.id)}
                        disabled={deletingQuestionId === q.id}
                        className="btn-secondary text-sm py-2 px-3 text-red-600 hover:text-red-700 disabled:opacity-50"
                      >
                        {deletingQuestionId === q.id ? 'Deleting…' : 'Delete'}
                      </button>
                    </div>
                  </div>
                  <ul className="mt-3 space-y-2">
                    {q.answers.map((a) => (
                      <li
                        key={a.id || a.orderIndex}
                        className={`flex items-center justify-between gap-3 font-mono text-sm ${a.isCorrect ? 'text-success' : 'text-text-secondary'}`}
                      >
                        <span>
                          {a.isCorrect ? '✓ ' : '○ '}{a.content}
                        </span>
                        {a.id && (
                          <button
                            type="button"
                            onClick={() => a.id && handleDeleteAnswer(a.id, q.id)}
                            disabled={deletingAnswerId === a.id || q.answers.length <= 2}
                            className="text-error text-xs disabled:opacity-50"
                          >
                            {deletingAnswerId === a.id ? 'Deleting…' : 'Remove'}
                          </button>
                        )}
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-text-primary mb-4">
            {editingQuestionId ? 'Edit Question' : 'Add Question'}
          </h2>
          <form onSubmit={handleSubmit} className="panel p-6 space-y-5">
            {formError && <ErrorMessage message={formError} />}

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
                  onChange={(e) => {
                    const type = e.target.value as 'single' | 'multiple';
                    setForm((prev) => {
                      if (!prev) return null;
                      let answers = prev.answers;
                      if (type === 'single') {
                        answers = prev.answers.map((a, i) => ({ ...a, isCorrect: i === 0 }));
                      }
                      return { ...prev, type, answers };
                    });
                  }}
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

            <div className="flex items-center gap-3">
              <button type="submit" disabled={saving} className="btn-primary disabled:opacity-50">
                {saving ? 'Saving…' : editingQuestionId ? 'Update Question' : 'Save Question'}
              </button>
              {editingQuestionId && (
                <button
                  type="button"
                  onClick={resetForm}
                  disabled={saving}
                  className="btn-secondary disabled:opacity-50"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </section>
      </div>
    </div>
  );
}
