const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:3001/api/v1';

export async function apiGet<T>(path: string): Promise<{ success: true; data: T } | { success: false; error: unknown }> {
  const response = await fetch(`${API_BASE_URL}${path}`);
  return response.json() as Promise<{ success: true; data: T } | { success: false; error: unknown }>;
}

export async function apiPost<T>(path: string, body: unknown): Promise<{ success: true; data: T } | { success: false; error: unknown }> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return response.json() as Promise<{ success: true; data: T } | { success: false; error: unknown }>;
}
