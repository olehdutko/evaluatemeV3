import { z } from 'zod';
import { apiGet, apiPost, ApiError } from '../../../src/lib/api-client';
import { successEnvelopeSchema } from '../../../src/lib/schemas/envelope.schema';
import * as authApi from '../../../src/lib/auth.api';

const schema = successEnvelopeSchema(z.string());

describe('api-client', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('returns parsed GET response', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ success: true, data: 'hello' }),
    } as unknown as Response);

    const response = await apiGet('/api/v1/test', schema);
    expect(response).toEqual({ success: true, data: 'hello' });
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/v1/test'),
      expect.objectContaining({ credentials: 'include' }),
    );
  });

  it('returns parsed POST response', async () => {
    const requestSchema = z.object({ name: z.string() });
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ success: true, data: 'created' }),
    } as unknown as Response);

    const response = await apiPost('/api/v1/test', { name: 'x' }, requestSchema, schema);
    expect(response).toEqual({ success: true, data: 'created' });
  });

  it('throws ApiError on non-ok response', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => ({ success: false, error: { code: 'INTERNAL_ERROR' } }),
    } as unknown as Response);

    await expect(apiGet('/api/v1/test', schema)).rejects.toThrow(ApiError);
  });

  it('refreshes token on 401 and retries once', async () => {
    const refreshSpy = jest.spyOn(authApi, 'refresh').mockResolvedValue({
      success: true,
      data: { expiresInSeconds: 900 },
    });

    global.fetch = jest
      .fn()
      .mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({ success: false, error: { code: 'UNAUTHORIZED' } }),
      } as unknown as Response)
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ success: true, data: 'after-refresh' }),
      } as unknown as Response);

    const response = await apiGet('/api/v1/test', schema);
    expect(response).toEqual({ success: true, data: 'after-refresh' });
    expect(refreshSpy).toHaveBeenCalledTimes(1);
    expect(global.fetch).toHaveBeenCalledTimes(2);
  });

  it('does not retry after refresh failure', async () => {
    const refreshSpy = jest.spyOn(authApi, 'refresh').mockRejectedValue(new Error('Refresh failed'));

    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 401,
      json: async () => ({ success: false, error: { code: 'UNAUTHORIZED' } }),
    } as unknown as Response);

    await expect(apiGet('/api/v1/test', schema)).rejects.toThrow('Refresh failed');
    expect(refreshSpy).toHaveBeenCalledTimes(1);
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });
});
