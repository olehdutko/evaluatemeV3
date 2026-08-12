'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import { getTechnologyQuestions, saveQuestion, deleteQuestion } from '../../../../../lib/admin.api';
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
  const [error, setError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const formRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    if (!id) return;
    loadTechnology(id);
  }, [id]);

  useEffect(() => {
    const list = listRef.current;
    if (!list) return;

    function handleScroll(): void {
      const currentList = listRef.current;
      if (!currentList) return;
      const max = currentList.scrollHeight - currentList.clientHeight;
      const value = max > 0 ? (currentList.scrollTop / max) * 100 : 0;
      setScrollProgress(value);
    }

    list.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => list.removeEventListener('scroll', handleScroll);
  }, [technology?.questions.length]);

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

  function selectQuestion(question: QuestionDetail) {
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
    formRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
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

  if (loading) return <p className="p-8 text-text-secondary font-body">Loading…</p>;
  if (!technology) return <ErrorMessage message={error || 'Technology not found'} className="m-6" />;

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col -mt-4">
      <header className="shrink-0 px-6 py-4 border-b border-border bg-bg-primary">
        <p className="font-mono text-xs uppercase tracking-[0.12em] text-accent mb-1">Content · {technology.name}</p>
        <h1 className="font-display text-2xl font-bold text-text-primary">Questions</h1>
      </header>

      {error && <ErrorMessage message={error} className="shrink-0 mx-6 mt-4" />}

      <div className="flex-1 flex overflow-hidden">
        <section className="w-1/2 flex flex-col border-r border-border">
          <div className="shrink-0 border-b border-border bg-bg-primary">
            <h2 className="px-6 py-3 font-display text-lg font-bold text-text-primary">
              Existing Questions ({technology.questions.length})
            </h2>
            <div className="h-1 w-full bg-bg-secondary">
              <div
                className="h-full bg-accent transition-all duration-150"
                style={{ width: `${scrollProgress}%` }}
                aria-hidden="true"
              />
            </div>
          </div>
          {technology.questions.length === 0 ? (
            <p className="p-6 text-text-secondary font-body">No questions for this technology yet.</p>
          ) : (
            <ul ref={listRef} className="flex-1 overflow-y-auto divide-y divide-border bg-bg-primary">
              {technology.questions.map((q) => {
                const isSelected = editingQuestionId === q.id;
                return (
                  <li
                    key={q.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => selectQuestion(q)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        selectQuestion(q);
                      }
                    }}
                    className={`px-5 py-4 cursor-pointer transition-colors outline-none ${
                      isSelected ? 'bg-bg-secondary ring-2 ring-inset ring-accent' : 'hover:bg-bg-secondary'
                    }`}
                    aria-pressed={isSelected}
                  >
                    <div className="min-w-0">
                      <p className="font-body text-text-primary font-bold">
                        {q.orderIndex}. {q.content}
                      </p>
                      <p className="text-text-secondary font-mono text-xs mt-1">
                        {q.type === 'single' ? 'Single choice' : 'Multiple choice'} · {q.score} point{q.score !== 1 ? 's' : ''}
                      </p>
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
                        </li>
                      ))}
                    </ul>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <section ref={formRef} className="w-1/2 flex flex-col overflow-y-auto bg-bg-primary">
          <h2 className="shrink-0 px-6 py-3 font-display text-lg font-bold text-text-primary border-b border-border">
            {editingQuestionId ? 'Edit Question' : 'Add Question'}
          </h2>
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
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

            <div className="flex items-center gap-3 flex-wrap">
              <button type="submit" disabled={saving} className="btn-primary disabled:opacity-50">
                {saving ? 'Saving…' : editingQuestionId ? 'Update Question' : 'Save Question'}
              </button>
              {editingQuestionId && (
                <>
                  <button
                    type="button"
                    onClick={resetForm}
                    disabled={saving}
                    className="btn-secondary disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteQuestion(editingQuestionId)}
                    disabled={saving || deletingQuestionId === editingQuestionId}
                    className="btn-secondary text-error hover:text-red-700 disabled:opacity-50"
                  >
                    {deletingQuestionId === editingQuestionId ? 'Deleting…' : 'Delete Question'}
                  </button>
                </>
              )}
            </div>
          </form>
        </section>
      </div>
    </div>
  );
}
