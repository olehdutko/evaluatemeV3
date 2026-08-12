'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { getTechnologies, createTechnology, updateTechnology, deleteTechnology } from '../../../lib/admin.api';
import { ErrorMessage } from '../../../components/ui/ErrorMessage';

interface Technology {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  updatedAt: string;
}

export default function AdminTechnologiesPage(): JSX.Element {
  const [technologies, setTechnologies] = useState<Technology[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [editing, setEditing] = useState<Technology | null>(null);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    loadTechnologies();
  }, []);

  function loadTechnologies() {
    setLoading(true);
    getTechnologies()
      .then((response) => setTechnologies(response.data))
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load technologies'))
      .finally(() => setLoading(false));
  }

  function resetForm() {
    setEditing(null);
    setName('');
    setSlug('');
    setDescription('');
    setFormError(null);
  }

  function startEdit(tech: Technology) {
    setEditing(tech);
    setName(tech.name);
    setSlug(tech.slug);
    setDescription(tech.description ?? '');
    setFormError(null);
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setFormError(null);

    const body = {
      name,
      slug: slug || undefined,
      description: description.trim() || null,
    };

    const promise = editing
      ? updateTechnology(editing.id, body)
      : createTechnology(body);

    promise
      .then((response) => {
        if (editing) {
          setTechnologies((prev) =>
            prev.map((t) => (t.id === response.data.id ? response.data : t)),
          );
        } else {
          setTechnologies((prev) => [response.data, ...prev]);
        }
        resetForm();
      })
      .catch((err) => {
        const message = err instanceof Error ? err.message : 'Failed to save technology';
        setFormError(message);
      })
      .finally(() => setSaving(false));
  }

  function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this technology?')) {
      return;
    }
    setDeletingId(id);
    deleteTechnology(id)
      .then(() => {
        setTechnologies((prev) => prev.filter((t) => t.id !== id));
        if (editing?.id === id) {
          resetForm();
        }
      })
      .catch((err) => setFormError(err instanceof Error ? err.message : 'Failed to delete technology'))
      .finally(() => setDeletingId(null));
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <header className="mb-10 border-b border-border pb-6">
        <p className="font-mono text-xs uppercase tracking-[0.12em] text-accent mb-3">Content</p>
        <h1 className="font-display text-3xl sm:text-4xl font-bold text-text-primary">Technologies</h1>
      </header>

      {error && <ErrorMessage message={error} className="mb-6" />}

      <div className="grid lg:grid-cols-2 gap-8">
        <section>
          <h2 className="font-display text-xl font-bold text-text-primary mb-4">Existing Technologies</h2>
          {loading ? (
            <p className="text-text-secondary font-body">Loading technologies…</p>
          ) : technologies.length === 0 ? (
            <p className="text-text-secondary font-body">No technologies yet.</p>
          ) : (
            <ul className="panel divide-y divide-border">
              {technologies.map((tech) => (
                <li key={tech.id} className="px-5 py-4 flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="font-display font-bold text-text-primary truncate">{tech.name}</p>
                    <p className="text-text-secondary font-mono text-xs">/{tech.slug}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => startEdit(tech)}
                      className="btn-secondary text-sm py-2 px-3"
                    >
                      Edit
                    </button>
                    <Link
                      href={`/admin/technologies/${encodeURIComponent(tech.id)}/questions`}
                      className="btn-secondary text-sm py-2 px-3"
                    >
                      Questions
                    </Link>
                    <button
                      type="button"
                      onClick={() => handleDelete(tech.id)}
                      disabled={deletingId === tech.id}
                      className="btn-secondary text-sm py-2 px-3 text-red-600 hover:text-red-700 disabled:opacity-50"
                    >
                      {deletingId === tech.id ? 'Deleting…' : 'Delete'}
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-text-primary mb-4">
            {editing ? 'Edit Technology' : 'Add Technology'}
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
              <span className="label-mono">Slug</span>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="auto-generated if empty"
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
                {saving ? 'Saving…' : editing ? 'Update Technology' : 'Create Technology'}
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
