import { cookies } from 'next/headers';
import { meResponseSchema } from '../schemas/auth';

export async function getSessionUser(): Promise<
  { id: string; email: string; username: string | null; role: 'user' | 'company' | 'admin'; credits: number } | null
> {
  const cookieStore = cookies();
  const accessToken = cookieStore.get('access_token')?.value;
  if (!accessToken) {
    return null;
  }

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/auth/me`, {
      headers: {
        Cookie: `access_token=${accessToken}`,
        Accept: 'application/json',
      },
      cache: 'no-store',
    });
    if (!response.ok) {
      return null;
    }
    const body = (await response.json()) as unknown;
    const parsed = meResponseSchema.safeParse(body);
    if (!parsed.success) {
      return null;
    }
    return parsed.data.data;
  } catch {
    return null;
  }
}
