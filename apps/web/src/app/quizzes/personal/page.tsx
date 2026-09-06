'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { ErrorMessage } from '../../../components/ui/ErrorMessage';

interface AnswerInput {
  content: string;
  isCorrect: boolean;
}

interface QuestionInput {
  content: string;
  type: 'single_choice' | 'multiple_choice';
  score: number;
  answers: AnswerInput[];
}

export default function PersonalQuizBuilderPage() {
  const router = useRouter();
  const [companyId] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('companyId');
  });
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [questions, setQuestions] = useState<QuestionInput[]>([
    { content: '', type: 'single_choice', score: 1, answers: [{ content: '', isCorrect: false }, { content: '', isCorrect: false }] },
  ]);
  const [error, setError] = useState<string | null>(null);

  const updateQuestion = (index: number, patch: Partial<QuestionInput>) => {
    setQuestions((prev) => prev.map((q, i) => (i === index ? { ...q, ...patch } : q)));
  };

  const updateAnswer = (qIndex: number, aIndex: number, patch: Partial<AnswerInput>) => {
    setQuestions((prev) =>
      prev.map((q, i) => {
        if (i !== qIndex) return q;
        const answers = q.answers.map((a, j) => (j === aIndex ? { ...a, ...patch } : a));
        return { ...q, answers };
      }),
    );
  };

  const addQuestion = () => {
    setQuestions((prev) => [
      ...prev,
      { content: '', type: 'single_choice', score: 1, answers: [{ content: '', isCorrect: false }, { content: '', isCorrect: false }] },
    ]);
  };

  const addAnswer = (qIndex: number) => {
    setQuestions((prev) =>
      prev.map((q, i) => (i === qIndex ? { ...q, answers: [...q.answers, { content: '', isCorrect: false }] } : q)),
    );
  };

  const submit = async () => {
    if (!companyId) {
      setError('No company profile selected');
      return;
    }
    const payload = {
      companyId,
      name,
      description,
      questions,
    };
    const res = await fetch('/api/v1/corporate/quizzes/personal', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = (await res.json().catch(() => ({}))) as { message?: string };
      setError(err.message || 'Failed to create quiz');
      return;
    }
    router.push('/campaigns');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold">Create Personal Quiz</h1>
      {error && <ErrorMessage message={error} />}
      <Card className="mb-6">
        <div className="mb-4">
          <label className="block text-sm font-medium">Name</label>
          <input value={name} onChange={(e) => setName(e.target.value)} className="w-full rounded border px-3 py-2" placeholder="Quiz name" />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium">Description</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="w-full rounded border px-3 py-2" rows={3} />
        </div>
      </Card>

      {questions.map((q, qIndex) => (
        <Card key={qIndex} className="mb-4">
          <div className="mb-2">
            <label className="block text-sm font-medium">Question {qIndex + 1}</label>
            <input
              value={q.content}
              onChange={(e) => updateQuestion(qIndex, { content: e.target.value })}
              className="w-full rounded border px-3 py-2"
              placeholder="Question text"
            />
          </div>
          <div className="mb-2">
            <label className="block text-sm font-medium">Type</label>
            <select
              value={q.type}
              onChange={(e) => updateQuestion(qIndex, { type: e.target.value as 'single_choice' | 'multiple_choice' })}
              className="w-full rounded border px-3 py-2"
            >
              <option value="single_choice">Single choice</option>
              <option value="multiple_choice">Multiple choice</option>
            </select>
          </div>
          {q.answers.map((a, aIndex) => (
            <div key={aIndex} className="mb-2 flex items-center gap-2">
              <input
                type={q.type === 'single_choice' ? 'radio' : 'checkbox'}
                checked={a.isCorrect}
                onChange={() => updateAnswer(qIndex, aIndex, { isCorrect: !a.isCorrect })}
                name={`correct-q${qIndex}`}
              />
              <input
                value={a.content}
                onChange={(e) => updateAnswer(qIndex, aIndex, { content: e.target.value })}
                className="flex-1 rounded border px-3 py-2"
                placeholder={`Answer ${aIndex + 1}`}
              />
            </div>
          ))}
          <Button onClick={() => addAnswer(qIndex)} variant="secondary">Add Answer</Button>
        </Card>
      ))}

      <div className="mb-6">
        <Button onClick={addQuestion} variant="secondary">Add Question</Button>
      </div>

      <Button onClick={() => void submit()} disabled={!name || questions.some((q) => !q.content || q.answers.some((a) => !a.content))}>Create Quiz</Button>
    </div>
  );
}
