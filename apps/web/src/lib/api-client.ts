import { z, ZodTypeAny, ZodType } from 'zod';
import { refresh } from './auth.api';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

let isRefreshing = false;
let refreshPromise: Promise<void> | null = null;

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly responseBody: unknown,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

function redirectToLogin(): void {
  if (typeof window !== 'undefined') {
    window.location.assign('/login');
  }
}

async function performRefresh(): Promise<void> {
  try {
    await refresh({ refreshToken: '' });
  } catch (err) {
    redirectToLogin();
    throw err;
  }
}

async function getRefreshPromise(): Promise<void> {
  if (!isRefreshing) {
    isRefreshing = true;
    refreshPromise = performRefresh().finally(() => {
      isRefreshing = false;
      refreshPromise = null;
    });
  }
  return refreshPromise as Promise<void>;
}

async function fetchWithAuth(
  url: string,
  init: RequestInit,
  retry = true,
): Promise<Response> {
  const response = await fetch(url, {
    ...init,
    credentials: 'include',
  });

  if (response.status === 401 && retry) {
    await getRefreshPromise();
    return fetchWithAuth(url, init, false);
  }

  return response;
}

export async function apiGet<T extends ZodTypeAny>(
  path: string,
  schema: T,
): Promise<NonNullable<z.infer<T>>> {
  const url = `${API_BASE_URL}${path}`;
  const response = await fetchWithAuth(url, {
    headers: { Accept: 'application/json' },
  });

  const body: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    throw new ApiError(response.status, body, `GET ${path} failed with ${response.status}`);
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    throw new ApiError(response.status, body, `Invalid response shape for GET ${path}`);
  }

  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return parsed.data;
}

export async function apiPost<
  TRequest extends ZodTypeAny,
  TResponse extends ZodTypeAny,
>(
  path: string,
  body: z.infer<TRequest>,
  requestSchema: ZodType<z.infer<TRequest>, TRequest['_output'], TRequest['_input']>,
  responseSchema: TResponse,
): Promise<NonNullable<z.infer<TResponse>>> {
  const validatedRequest: z.infer<TRequest> = requestSchema.parse(body);
  const url = `${API_BASE_URL}${path}`;
  const response = await fetchWithAuth(url, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(validatedRequest),
  });

  const responseBody: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    throw new ApiError(response.status, responseBody, `POST ${path} failed with ${response.status}`);
  }

  const parsed = responseSchema.safeParse(responseBody);
  if (!parsed.success) {
    throw new ApiError(response.status, responseBody, `Invalid response shape for POST ${path}`);
  }

  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return parsed.data;
}

export async function apiPut<
  TRequest extends ZodTypeAny,
  TResponse extends ZodTypeAny,
>(
  path: string,
  body: z.infer<TRequest>,
  requestSchema: ZodType<z.infer<TRequest>, TRequest['_output'], TRequest['_input']>,
  responseSchema: TResponse,
): Promise<NonNullable<z.infer<TResponse>>> {
  const validatedRequest: z.infer<TRequest> = requestSchema.parse(body);
  const url = `${API_BASE_URL}${path}`;
  const response = await fetchWithAuth(url, {
    method: 'PUT',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(validatedRequest),
  });

  const responseBody: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    throw new ApiError(response.status, responseBody, `PUT ${path} failed with ${response.status}`);
  }

  const parsed = responseSchema.safeParse(responseBody);
  if (!parsed.success) {
    throw new ApiError(response.status, responseBody, `Invalid response shape for PUT ${path}`);
  }

  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return parsed.data;
}
