import { z } from 'zod';
import { apiGet, apiPost, ApiError } from '../../../src/lib/api-client';

const successSchema = z.object({
  success: z.literal(true),
  data: z.object({ id: z.string().uuid() }),
});

const requestSchema = z.object({ name: z.string().min(1) });

describe('api-client', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('returns parsed data for a successful GET', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        success: true,
        data: { id: '550e8400-e29b-41d4-a716-446655440000' },
      }),
    } as Response);

    const result = await apiGet('/api/v1/test', successSchema);
    expect(result.success).toBe(true);
    expect(result.data.id).toBe('550e8400-e29b-41d4-a716-446655440000');
  });

  it('throws ApiError for a non-2xx response', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => ({ success: false, error: { code: 'INTERNAL_ERROR', message: 'boom' }, meta: null }),
    } as Response);

    await expect(apiGet('/api/v1/test', successSchema)).rejects.toBeInstanceOf(ApiError);
  });

  it('throws ApiError for an invalid response shape', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ success: true, data: { id: 'not-a-uuid' } }),
    } as Response);

    await expect(apiGet('/api/v1/test', successSchema)).rejects.toBeInstanceOf(ApiError);
  });

  it('posts a validated request and returns parsed response', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 201,
      json: async () => ({
        success: true,
        data: { id: '550e8400-e29b-41d4-a716-446655440000' },
      }),
    } as Response);

    const result = await apiPost(
      '/api/v1/test',
      { name: 'Test' },
      requestSchema,
      successSchema,
    );

    expect(result.success).toBe(true);
    expect(result.data.id).toBe('550e8400-e29b-41d4-a716-446655440000');
  });
});
