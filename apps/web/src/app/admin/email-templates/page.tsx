'use client';

import React, { useEffect, useState } from 'react';
import { getEmailTemplates, getEmailTemplate, updateEmailTemplate } from '../../../lib/admin.api';
import { ErrorMessage } from '../../../components/ui/ErrorMessage';

interface TemplateSummary {
  id: string;
  name: string;
  subject: string;
  updatedAt: string;
}

interface TemplateDetail extends TemplateSummary {
  bodyHtml: string;
  bodyText: string | null;
  variables: Record<string, string> | null;
}

export default function AdminEmailTemplatesPage(): JSX.Element {
  const [templates, setTemplates] = useState<TemplateSummary[]>([]);
  const [selected, setSelected] = useState<TemplateDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    getEmailTemplates()
      .then((response) => setTemplates(response.data))
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load templates'))
      .finally(() => setLoading(false));
  }, []);

  function handleSelect(id: string) {
    setSelected(null);
    setSaveError(null);
    getEmailTemplate(id)
      .then((response) => setSelected(response.data))
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load template'));
  }

  function handleSave(updated: TemplateDetail) {
    setSaving(true);
    setSaveError(null);
    updateEmailTemplate(updated.id, {
      subject: updated.subject,
      bodyHtml: updated.bodyHtml,
      bodyText: updated.bodyText,
      variables: updated.variables,
    })
      .then((response) => {
        setSelected(response.data);
        setTemplates((prev) =>
          prev.map((t) => (t.id === response.data.id ? { ...t, subject: response.data.subject, updatedAt: response.data.updatedAt } : t)),
        );
      })
      .catch((err) => setSaveError(err instanceof Error ? err.message : 'Failed to save template'))
      .finally(() => setSaving(false));
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <header className="mb-10 border-b border-border pb-6">
        <p className="font-mono text-xs uppercase tracking-[0.12em] text-accent mb-3">Messaging</p>
        <h1 className="font-display text-3xl sm:text-4xl font-bold text-text-primary">Email Templates</h1>
      </header>

      {error && <ErrorMessage message={error} className="mb-6" />}

      <div className="grid lg:grid-cols-3 gap-8">
        <aside className="lg:col-span-1">
          {loading ? (
            <p className="text-text-secondary font-body">Loading templates…</p>
          ) : templates.length === 0 ? (
            <p className="text-text-secondary font-body">No email templates found.</p>
          ) : (
            <ul className="panel divide-y divide-border">
              {templates.map((template) => (
                <li key={template.id}>
                  <button
                    type="button"
                    onClick={() => handleSelect(template.id)}
                    className={`w-full text-left px-5 py-4 transition-colors ${
                      selected?.id === template.id ? 'bg-bg-secondary' : 'hover:bg-bg-secondary'
                    }`}
                  >
                    <p className="font-display font-bold text-text-primary">{template.name}</p>
                    <p className="text-text-secondary font-body text-sm truncate">{template.subject}</p>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </aside>

        <section className="lg:col-span-2">
          {selected ? (
            <EmailTemplateEditor template={selected} onSave={handleSave} saving={saving} error={saveError} />
          ) : (
            <div className="panel p-8 text-center">
              <p className="text-text-secondary font-body">Select a template to edit.</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function EmailTemplateEditor({
  template,
  onSave,
  saving,
  error,
}: {
  template: TemplateDetail;
  onSave: (template: TemplateDetail) => void;
  saving: boolean;
  error: string | null;
}): JSX.Element {
  const [subject, setSubject] = useState(template.subject);
  const [bodyHtml, setBodyHtml] = useState(template.bodyHtml);
  const [bodyText, setBodyText] = useState(template.bodyText ?? '');
  const [variablesJson, setVariablesJson] = useState(JSON.stringify(template.variables ?? {}, null, 2));

  useEffect(() => {
    setSubject(template.subject);
    setBodyHtml(template.bodyHtml);
    setBodyText(template.bodyText ?? '');
    setVariablesJson(JSON.stringify(template.variables ?? {}, null, 2));
  }, [template]);

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    let variables: Record<string, string> | null = null;
    try {
      variables = variablesJson.trim() ? (JSON.parse(variablesJson) as Record<string, string>) : null;
    } catch {
      // Let the server reject invalid JSON; keep UX simple.
      variables = null;
    }
    onSave({
      ...template,
      subject,
      bodyHtml,
      bodyText: bodyText.trim() || null,
      variables,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="panel p-6 space-y-5">
      <div className="border-b border-border pb-4 mb-2">
        <h2 className="font-display text-xl font-bold text-text-primary">{template.name}</h2>
        <p className="text-text-secondary font-mono text-xs mt-1">Last updated {new Date(template.updatedAt).toLocaleString()}</p>
      </div>

      {error && <ErrorMessage message={error} />}

      <label className="block">
        <span className="label-mono">Subject</span>
        <input type="text" value={subject} onChange={(e) => setSubject(e.target.value)} required className="input-field" />
      </label>

      <label className="block">
        <span className="label-mono">HTML Body</span>
        <textarea
          value={bodyHtml}
          onChange={(e) => setBodyHtml(e.target.value)}
          required
          rows={12}
          className="input-field font-mono text-sm"
        />
      </label>

      <label className="block">
        <span className="label-mono">Plain Text Body</span>
        <textarea
          value={bodyText}
          onChange={(e) => setBodyText(e.target.value)}
          rows={6}
          className="input-field font-mono text-sm"
        />
      </label>

      <label className="block">
        <span className="label-mono">Variables (JSON)</span>
        <textarea
          value={variablesJson}
          onChange={(e) => setVariablesJson(e.target.value)}
          rows={4}
          className="input-field font-mono text-sm"
        />
      </label>

      <div className="pt-2">
        <button type="submit" disabled={saving} className="btn-primary disabled:opacity-50">
          {saving ? 'Saving…' : 'Save Template'}
        </button>
      </div>
    </form>
  );
}
