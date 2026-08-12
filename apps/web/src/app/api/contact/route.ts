import { NextResponse } from 'next/server';

export const runtime = 'edge';

export async function POST(request: Request): Promise<NextResponse> {
  const body: unknown = await request.json().catch(() => ({}));
  const { name, email, message } = body as { name?: string; email?: string; message?: string };

  if (!name || !email || !message) {
    return NextResponse.json({ success: false, error: 'All fields are required' }, { status: 400 });
  }

  return NextResponse.json({ success: true, message: 'Message received' }, { status: 200 });
}
