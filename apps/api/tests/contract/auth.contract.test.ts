import {
  loginRequestSchema,
  loginResponseSchema,
  registerRequestSchema,
  registerResponseSchema,
} from '../../src/lib/schemas/auth.schema';

describe('Auth endpoint contracts', () => {
  it('validates a register request', () => {
    const payload = {
      email: 'user@example.com',
      password: 'Password123',
      role: 'user',
    };
    expect(() => registerRequestSchema.parse(payload)).not.toThrow();
  });

  it('rejects an invalid register request', () => {
    const payload = {
      email: 'not-an-email',
      password: 'short',
      role: 'admin',
    };
    expect(() => registerRequestSchema.parse(payload)).toThrow();
  });

  it('rejects admin registration through public schema', () => {
    const payload = {
      email: 'admin@example.com',
      password: 'Password123',
      role: 'admin',
    };
    expect(() => registerRequestSchema.parse(payload)).toThrow();
  });

  it('validates a register response', () => {
    const payload = {
      success: true,
      data: {
        id: '550e8400-e29b-41d4-a716-446655440000',
        email: 'user@example.com',
        username: null,
        role: 'user',
        activationStatus: 'pending',
        credits: 10,
        createdAt: '2026-08-10T12:00:00Z',
      },
    };
    expect(() => registerResponseSchema.parse(payload)).not.toThrow();
  });

  it('validates a login request', () => {
    const payload = {
      email: 'user@example.com',
      password: 'Password123',
    };
    expect(() => loginRequestSchema.parse(payload)).not.toThrow();
  });

  it('validates a login response', () => {
    const payload = {
      success: true,
      data: {
        expiresInSeconds: 900,
      },
    };
    expect(() => loginResponseSchema.parse(payload)).not.toThrow();
  });
});
