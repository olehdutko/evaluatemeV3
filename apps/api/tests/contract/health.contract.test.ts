import { healthResponseSchema } from '../../src/lib/schemas/health';

describe('Health endpoint contract', () => {
  it('validates the expected response shape', () => {
    const validResponse = {
      success: true,
      data: {
        status: 'ok',
        database: 'ok',
        latencyMs: 15,
        timestamp: new Date().toISOString(),
      },
    };

    expect(() => healthResponseSchema.parse(validResponse)).not.toThrow();
  });

  it('rejects responses with missing fields', () => {
    const invalidResponse = {
      success: true,
      data: {
        status: 'ok',
      },
    };

    expect(() => healthResponseSchema.parse(invalidResponse)).toThrow();
  });

  it('rejects non-ok status values', () => {
    const invalidResponse = {
      success: true,
      data: {
        status: 'degraded',
        database: 'ok',
        latencyMs: 15,
        timestamp: new Date().toISOString(),
      },
    };

    expect(() => healthResponseSchema.parse(invalidResponse)).toThrow();
  });
});
