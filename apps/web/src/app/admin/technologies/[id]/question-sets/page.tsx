'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  getTechnologyQuestionSets,
  createQuestionSet,
  updateQuestionSet,
  deleteQuestionSet,
} from '../../../../../lib/admin.api';
import { ErrorMessage } from '../../../../../components/ui/ErrorMessage';

interface QuestionSet {
  id: string;
  technologyId: string;
  name: string;
  description: string | null;
  questionCount: number;
  updatedAt: string;
}

export default function AdminTechnologyQuestionSetsPage(): JSX.Element {
  const params = useParams();
  const technologyId = Array.isArray(params.id) ? params.id[0] : params.id;
  const [questionSets, setQuestionSets] = useState<QuestionSet[]>([]);
  const [technologyName, setTechnologyName] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [editing, setEditing] = useState<QuestionSet | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (!technologyId) return;
    loadQuestionSets();
  }, [technologyId]);

  function loadQuestionSets() {
    if (!technologyId) return;
    setLoading(true);
    getTechnologyQuestionSets(technologyId)
      .then((response) => {
        setQuestionSets(response.data);
        setTechnologyName('');
        setError(null);
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load question sets'))
      .finally(() => setLoading(false));
  }

  function resetForm() {
    setEditing(null);
    setName('');
    setDescription('');
    setFormError(null);
  }

  function startEdit(qs: QuestionSet) {
    setEditing(qs);
    setName(qs.name);
    setDescription(qs.description ?? '');
    setFormError(null);
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!technologyId) return;
    setSaving(true);
    setFormError(null);

    const descriptionValue = description.trim() || null;

    const promise = editing
      ? updateQuestionSet(editing.id, { name, description: descriptionValue })
      : createQuestionSet({ technologyId, name, description: descriptionValue });

    promise
      .then((response) => {
        if (editing) {
          setQuestionSets((prev) =>
            prev.map((qs) => (qs.id === response.data.id ? response.data : qs)),
          );
        } else {
          setQuestionSets((prev) => [response.data, ...prev]);
        }
        resetForm();
      })
      .catch((err) => {
        const message = err instanceof Error ? err.message : 'Failed to save question set';
        setFormError(message);
      })
      .finally(() => setSaving(false));
  }

  function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this question set?')) {
      return;
    }
    setDeletingId(id);
    deleteQuestionSet(id)
      .then(() => {
        setQuestionSets((prev) => prev.filter((qs) => qs.id !== id));
        if (editing?.id === id) {
          resetForm();
        }
      })
      .catch((err) => setFormError(err instanceof Error ? err.message : 'Failed to delete question set'))
      .finally(() => setDeletingId(null));
  }

  const title = technologyName || 'Question Sets';

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <header className="mb-10 border-b border-border pb-6">
        <p className="font-mono text-xs uppercase tracking-[0.12em] text-accent mb-3">Content · Technology</p>
        <h1 className="font-display text-3xl sm:text-4xl font-bold text-text-primary">{title}</h1>
      </header>

      {error && <ErrorMessage message={error} className="mb-6" />}

      <div className="grid lg:grid-cols-2 gap-8">
        <section>
          <h2 className="font-display text-xl font-bold text-text-primary mb-4">Existing Question Sets</h2>
          {loading ? (
            <p className="text-text-secondary font-body">Loading question sets…</p>
          ) : questionSets.length === 0 ? (
            <p className="text-text-secondary font-body">No question sets for this technology yet.</p>
          ) : (
            <ul className="panel divide-y divide-border">
              {questionSets.map((qs) => (
                <li key={qs.id} className="px-5 py-4 flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="font-display font-bold text-text-primary truncate">{qs.name}</p>
                    <p className="text-text-secondary font-mono text-xs">
                      {qs.questionCount} question{qs.questionCount !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => startEdit(qs)}
                      className="btn-secondary text-sm py-2 px-3"
                    >
                      Edit
                    </button>
                    <Link
                      href={`/admin/question-sets/${encodeURIComponent(qs.id)}/questions`}
                      className="btn-secondary text-sm py-2 px-3"
                    >
                      Questions
                    </Link>
                    <button
                      type="button"
                      onClick={() => handleDelete(qs.id)}
                      disabled={deletingId === qs.id}
                      className="btn-secondary text-sm py-2 px-3 text-red-600 hover:text-red-700 disabled:opacity-50"
                    >
                      {deletingId === qs.id ? 'Deleting…' : 'Delete'}
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-text-primary mb-4">
            {editing ? 'Edit Question Set' : 'Add Question Set'}
          </h2>
          <form onSubmit={handleSubmit} className="panel p-6 space-y-5">
            {formError && <ErrorMessage message={formError} />}

            <label className="block">
              <span className="label-mono">Name</span>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="input-field"
              />
            </label>
            <label className="block">
              <span className="label-mono">Description</span>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="input-field"
              />
            </label>
            <div className="flex items-center gap-3">
              <button type="submit" disabled={saving} className="btn-primary disabled:opacity-50">
                {saving ? 'Saving…' : editing ? 'Update Question Set' : 'Create Question Set'}
              </button>
              {editing && (
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
