'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { getTechnologies, createTechnology } from '../../../lib/admin.api';
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
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getTechnologies()
      .then((response) => setTechnologies(response.data))
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load technologies'))
      .finally(() => setLoading(false));
  }, []);

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    createTechnology({
      name,
      slug: slug || undefined,
      description: description.trim() || null,
    })
      .then((response) => {
        setTechnologies((prev) => [response.data, ...prev]);
        setName('');
        setSlug('');
        setDescription('');
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to create technology'))
      .finally(() => setSaving(false));
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
                <li key={tech.id} className="px-5 py-4 flex items-center justify-between">
                  <div>
                    <p className="font-display font-bold text-text-primary">{tech.name}</p>
                    <p className="text-text-secondary font-mono text-xs">/{tech.slug}</p>
                  </div>
                  <Link
                    href={`/admin/technologies/${encodeURIComponent(tech.id)}/questions`}
                    className="btn-secondary text-sm py-2 px-4"
                  >
                    Questions
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-text-primary mb-4">Add Technology</h2>
          <form onSubmit={handleSubmit} className="panel p-6 space-y-5">
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
            <button type="submit" disabled={saving} className="btn-primary disabled:opacity-50">
              {saving ? 'Creating…' : 'Create Technology'}
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}
