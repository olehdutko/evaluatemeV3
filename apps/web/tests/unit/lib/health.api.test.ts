import { fetchHealth } from '../../../src/lib/health.api';

describe('health.api', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('fetches and validates health response', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        success: true,
        data: {
          status: 'ok',
          database: 'ok',
          latencyMs: 12,
          timestamp: '2026-08-10T12:00:00Z',
        },
      }),
    } as Response);

    const result = await fetchHealth();
    expect(result.success).toBe(true);
    expect(result.data.status).toBe('ok');
  });
});
