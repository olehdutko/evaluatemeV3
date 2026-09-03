import { NextResponse } from 'next/server';

export const runtime = 'edge';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4001';

interface PriceData {
  price: number;
}

export async function GET(): Promise<NextResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/public-info`, {
      headers: { Accept: 'application/json' },
    });
    const payload: unknown = await response.json().catch(() => null);

    if (response.ok && payload && typeof payload === 'object' && 'success' in payload && payload.success === true) {
      const settings = (payload as { data?: { creditSettings?: Record<string, string> } }).data?.creditSettings ?? {};
      const rate = Number.parseFloat(settings.credit_to_usd_rate ?? '1');
      const testCredits = Number.parseFloat(settings.test_price_credits ?? '3');
      const price = Number.isFinite(rate * testCredits) ? rate * testCredits : 3;
      return NextResponse.json({ success: true, data: { price } } satisfies { success: true; data: PriceData }, { status: 200 });
    }
  } catch {
    // Fall back to default price if the API is unreachable.
  }

  return NextResponse.json({ success: true, data: { price: 3 } } satisfies { success: true; data: PriceData }, { status: 200 });
}
