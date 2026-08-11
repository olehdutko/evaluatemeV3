'use client';

import React, { useEffect, useState } from 'react';
import { getLandingAds, createLandingAd, updateLandingAd } from '../../../lib/admin.api';
import { ErrorMessage } from '../../../components/ui/ErrorMessage';

interface LandingAd {
  id: string;
  title: string;
  position: 'home_top' | 'home_bottom' | 'sidebar';
  isActive: boolean;
  updatedAt: string;
}

type LandingAdForm = {
  title: string;
  content: string;
  imageUrl: string;
  linkUrl: string;
  position: LandingAd['position'];
  isActive: boolean;
};

const emptyForm: LandingAdForm = {
  title: '',
  content: '',
  imageUrl: '',
  linkUrl: '',
  position: 'home_top',
  isActive: true,
};

const positionLabels: Record<LandingAd['position'], string> = {
  home_top: 'Home top',
  home_bottom: 'Home bottom',
  sidebar: 'Sidebar',
};

export default function AdminLandingAdsPage(): JSX.Element {
  const [ads, setAds] = useState<LandingAd[]>([]);
  const [form, setForm] = useState<LandingAdForm>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getLandingAds()
      .then((response) => setAds(response.data))
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load ads'))
      .finally(() => setLoading(false));
  }, []);

  function startEdit(ad: LandingAd) {
    const original = ads.find((a) => a.id === ad.id);
    if (!original) return;
    setEditingId(ad.id);
    setError(null);
    // We do not store full details in list; fetch would be needed for a real app.
    // For now seed a minimal form and let admin re-enter content.
    setForm({
      title: ad.title,
      content: '',
      imageUrl: '',
      linkUrl: '',
      position: ad.position,
      isActive: ad.isActive,
    });
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(emptyForm);
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError(null);

    const payload = {
      title: form.title,
      content: form.content.trim() || null,
      imageUrl: form.imageUrl.trim() || null,
      linkUrl: form.linkUrl.trim() || null,
      position: form.position,
      isActive: form.isActive,
    };

    const promise = editingId
      ? updateLandingAd(editingId, payload)
      : createLandingAd(payload);

    promise
      .then((response) => {
        setAds((prev) => {
          const updated = prev.map((a) =>
            a.id === response.data.id
              ? { ...a, title: response.data.title, position: response.data.position, isActive: response.data.isActive, updatedAt: response.data.updatedAt }
              : a,
          );
          if (!editingId) {
            updated.unshift({ ...response.data });
          }
          return updated;
        });
        cancelEdit();
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to save ad'))
      .finally(() => setSaving(false));
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <header className="mb-10 border-b border-border pb-6">
        <p className="font-mono text-xs uppercase tracking-[0.12em] text-accent mb-3">Marketing</p>
        <h1 className="font-display text-3xl sm:text-4xl font-bold text-text-primary">Landing Ads</h1>
      </header>

      {error && <ErrorMessage message={error} className="mb-6" />}

      <div className="grid lg:grid-cols-2 gap-8">
        <section>
          <h2 className="font-display text-xl font-bold text-text-primary mb-4">Existing Ads</h2>
          {loading ? (
            <p className="text-text-secondary font-body">Loading ads…</p>
          ) : ads.length === 0 ? (
            <p className="text-text-secondary font-body">No landing ads yet.</p>
          ) : (
            <ul className="panel divide-y divide-border">
              {ads.map((ad) => (
                <li key={ad.id} className="px-5 py-4 flex items-center justify-between">
                  <div>
                    <p className="font-display font-bold text-text-primary">{ad.title}</p>
                    <p className="text-text-secondary font-body text-sm">
                      {positionLabels[ad.position]} · {ad.isActive ? 'Active' : 'Inactive'}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => startEdit(ad)}
                    className="btn-secondary text-sm py-2 px-4"
                  >
                    Edit
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-text-primary mb-4">
            {editingId ? 'Edit Ad' : 'Create Ad'}
          </h2>
          <form onSubmit={handleSubmit} className="panel p-6 space-y-5">
            <label className="block">
              <span className="label-mono">Title</span>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                required
                className="input-field"
              />
            </label>

            <label className="block">
              <span className="label-mono">Content</span>
              <textarea
                value={form.content}
                onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
                rows={4}
                className="input-field"
              />
            </label>

            <div className="grid sm:grid-cols-2 gap-4">
              <label className="block">
                <span className="label-mono">Image URL</span>
                <input
                  type="url"
                  value={form.imageUrl}
                  onChange={(e) => setForm((f) => ({ ...f, imageUrl: e.target.value }))}
                  className="input-field"
                />
              </label>
              <label className="block">
                <span className="label-mono">Link URL</span>
                <input
                  type="url"
                  value={form.linkUrl}
                  onChange={(e) => setForm((f) => ({ ...f, linkUrl: e.target.value }))}
                  className="input-field"
                />
              </label>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <label className="block">
                <span className="label-mono">Position</span>
                <select
                  value={form.position}
                  onChange={(e) => setForm((f) => ({ ...f, position: e.target.value as LandingAd['position'] }))}
                  className="input-field"
                >
                  {Object.entries(positionLabels).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </label>
              <label className="flex items-center gap-3 pt-6">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
                  className="h-5 w-5 accent-accent"
                />
                <span className="label-mono mb-0">Active</span>
              </label>
            </div>

            <div className="flex gap-3 pt-2">
              <button type="submit" disabled={saving} className="btn-primary disabled:opacity-50">
                {saving ? 'Saving…' : editingId ? 'Update Ad' : 'Create Ad'}
              </button>
              {editingId && (
                <button type="button" onClick={cancelEdit} className="btn-secondary">
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
