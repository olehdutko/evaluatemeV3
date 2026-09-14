'use client';

import { useEffect, useState } from 'react';
import { CORPORATE_API_BASE } from '../../lib/corporate-api';
import { fetchTechnologies, fetchTechnologyPreview } from '../../lib/technology.api';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { ErrorMessage } from '../ui/ErrorMessage';

interface CreateAccessCodeFormProps {
  campaignId: string;
  companyId: string;
  onCreated: () => void;
}

interface TechnologyOption {
  id: string;
  name: string;
  slug: string;
}

interface QuestionSetOption {
  id: string;
  title: string;
  questionCount: number;
  durationMinutes: number;
}

export function CreateAccessCodeForm({ campaignId, companyId, onCreated }: CreateAccessCodeFormProps) {
  const [testeeName, setTesteeName] = useState('');
  const [testeeEmail, setTesteeEmail] = useState('');
  const [technologySlug, setTechnologySlug] = useState<string>('');
  const [questionSetId, setQuestionSetId] = useState<string>('');
  const [technologies, setTechnologies] = useState<TechnologyOption[]>([]);
  const [questionSets, setQuestionSets] = useState<QuestionSetOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchTechnologies()
      .then((response) => {
        if (!cancelled) setTechnologies(response.data);
      })
      .catch(() => {
        if (!cancelled) setError('Failed to load technologies');
      });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!technologySlug) {
      setQuestionSets([]);
      setQuestionSetId('');
      return;
    }
    let cancelled = false;
    fetchTechnologyPreview(technologySlug)
      .then((response) => {
        if (!cancelled) {
          setQuestionSets(response.data.questionSets);
          setQuestionSetId(response.data.questionSets[0]?.id ?? '');
        }
      })
      .catch(() => {
        if (!cancelled) setError('Failed to load question sets');
      });
    return () => { cancelled = true; };
  }, [technologySlug]);

  const isEmailValid = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const selectedSet = questionSets.find((qs) => qs.id === questionSetId);

  const isFormValid =
    testeeName.trim().length > 0 &&
    isEmailValid(testeeEmail.trim()) &&
    questionSetId.length > 0 &&
    selectedSet !== undefined;

  const create = async () => {
    if (!isFormValid || !selectedSet) return;
    setLoading(true);
    setError(null);
    const payload = {
      companyId,
      testeeName: testeeName.trim(),
      testeeEmail: testeeEmail.trim(),
      questionSetId,
      questionCount: selectedSet.questionCount,
      durationMinutes: selectedSet.durationMinutes,
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
      setTesteeName('');
      setTesteeEmail('');
      setTechnologySlug('');
      setQuestionSetId('');
      onCreated();
    }
    setLoading(false);
  };

  return (
    <Card className="mb-6">
      {error && <ErrorMessage message={error} />}
      <div className="flex flex-col items-end gap-3 lg:flex-row">
        <label className="block flex-1">
          <span className="label-mono">Testee name</span>
          <input
            id="testeeName"
            type="text"
            value={testeeName}
            onChange={(e) => setTesteeName(e.target.value)}
            placeholder="Name"
            className="input-field w-full"
          />
        </label>
        <label className="block flex-1">
          <span className="label-mono">Testee email</span>
          <input
            id="testeeEmail"
            type="email"
            value={testeeEmail}
            onChange={(e) => setTesteeEmail(e.target.value)}
            placeholder="Email"
            className="input-field w-full"
          />
        </label>
        <label className="block flex-1">
          <span className="label-mono">Technology</span>
          <select
            id="technology"
            value={technologySlug}
            onChange={(e) => setTechnologySlug(e.target.value)}
            className="input-field w-full"
          >
            <option value="">Select technology</option>
            {technologies.map((t) => (
              <option key={t.id} value={t.slug}>{t.name}</option>
            ))}
          </select>
        </label>
        <label className="block flex-1">
          <span className="label-mono">Question set</span>
          <select
            id="questionSet"
            value={questionSetId}
            onChange={(e) => setQuestionSetId(e.target.value)}
            disabled={questionSets.length === 0}
            className="input-field w-full"
          >
            <option value="">{questionSets.length === 0 ? 'Select technology first' : 'Select question set'}</option>
            {questionSets.map((qs) => (
              <option key={qs.id} value={qs.id}>{qs.title} ({qs.questionCount} q / {qs.durationMinutes} min)</option>
            ))}
          </select>
        </label>
        <Button onClick={() => void create()} disabled={!isFormValid || loading} className="w-full lg:w-auto">
          {loading ? 'Creating...' : 'Create'}
        </Button>
      </div>
    </Card>
  );
}
