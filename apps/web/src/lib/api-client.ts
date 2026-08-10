import { z, ZodTypeAny, ZodType } from 'zod';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

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

export async function apiGet<T extends ZodTypeAny>(
  path: string,
  schema: T,
): Promise<NonNullable<z.infer<T>>> {
  const url = `${API_BASE_URL}${path}`;
  const response = await fetch(url, {
    credentials: 'include',
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
  const response = await fetch(url, {
    method: 'POST',
    credentials: 'include',
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
