import { NextResponse } from 'next/server';

export const runtime = 'edge';

interface CounterValue {
  value: number;
  label: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4001';

export async function GET(): Promise<NextResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/public-info`, {
      headers: { Accept: 'application/json' },
    });
    const payload: unknown = await response.json().catch(() => null);

    if (response.ok && payload && typeof payload === 'object' && 'success' in payload && payload.success === true) {
      const data = (payload as { data?: { counters?: Record<string, number> } }).data;
      const counters = data?.counters;
      if (counters) {
        return NextResponse.json(
          {
            success: true,
            data: {
              technologies: { value: counters.technologies ?? 0, label: 'Technologies and languages' },
              users: { value: counters.users ?? 0, label: 'Registered users' },
              questions: { value: counters.questions ?? 0, label: 'Total test questions' },
              testsPassed: { value: counters.testsPassed ?? 0, label: 'Passed tests' },
            } satisfies Record<string, CounterValue>,
          },
          { status: 200 },
        );
      }
    }
  } catch {
    // Fall back to static values if the API is unreachable.
  }

  const data: Record<string, CounterValue> = {
    technologies: { value: 18, label: 'Technologies and languages' },
    users: { value: 1240, label: 'Registered users' },
    questions: { value: 6535, label: 'Total test questions' },
    testsPassed: { value: 8932, label: 'Passed tests' },
  };

  return NextResponse.json({ success: true, data }, { status: 200 });
}
