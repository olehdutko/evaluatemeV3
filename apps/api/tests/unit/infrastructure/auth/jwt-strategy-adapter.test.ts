import { JwtStrategyAdapter } from '../../../../src/infrastructure/auth/jwt-strategy-adapter';
import { ITokenPayload } from '@evaluateme/domain';

describe('JwtStrategyAdapter', () => {
  let adapter: JwtStrategyAdapter;

  beforeAll(() => {
    process.env.JWT_SECRET = 'test-secret-must-be-at-least-32-characters-long';
    process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-must-be-at-least-32-characters';
    // Re-require to pick up new env values
    jest.resetModules();
    const { JwtStrategyAdapter: Adapter } = require('../../../../src/infrastructure/auth/jwt-strategy-adapter');
    adapter = new Adapter();
  });

  it('signs and verifies an access token', async () => {
    const payload: ITokenPayload = {
      sub: 'user-1',
      email: 'user@example.com',
      role: 'user',
      type: 'access',
    };

    const token = await adapter.sign(payload, '1h');
    const verified = await adapter.verify(token);
    expect(verified.sub).toBe('user-1');
    expect(verified.email).toBe('user@example.com');
    expect(verified.type).toBe('access');
  });

  it('signs and verifies a refresh token', async () => {
    const payload: ITokenPayload = {
      sub: 'user-1',
      email: 'user@example.com',
      role: 'user',
      type: 'refresh',
    };

    const token = await adapter.sign(payload, '7d');
    const verified = await adapter.verify(token);
    expect(verified.type).toBe('refresh');
  });
});
