import { NextResponse } from 'next/server';

export const runtime = 'edge';

interface CounterValue {
  value: number;
  label: string;
}

export async function GET(): Promise<NextResponse> {
  await Promise.resolve();
  const data: Record<string, CounterValue> = {
    technologies: { value: 18, label: 'Technologies and languages' },
    users: { value: 1240, label: 'Registered users' },
    questions: { value: 6535, label: 'Total test questions' },
    testsPassed: { value: 8932, label: 'Passed tests' },
  };

  return NextResponse.json({ success: true, data }, { status: 200 });
}
