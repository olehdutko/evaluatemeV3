import { RefreshUseCase } from '../../../../src/application/auth/refresh.use-case';
import { IJwtStrategy, ITokenBlacklist, ITokenPayload } from '@evaluateme/domain';

class FakeJwtStrategy implements IJwtStrategy {
  async sign(payload: ITokenPayload, _expiresIn?: string): Promise<string> {
    return `signed-${payload.type}-${payload.sub}`;
  }

  async verify(token: string): Promise<ITokenPayload> {
    if (token === 'valid-refresh') {
      return { sub: '1', email: 'a@b.com', role: 'user', type: 'refresh' };
    }
    if (token === 'access-token') {
      return { sub: '1', email: 'a@b.com', role: 'user', type: 'access' };
    }
    throw new Error('Invalid');
  }
}

class FakeBlacklist implements ITokenBlacklist {
  tokens = new Set<string>();

  async add(token: string): Promise<void> {
    this.tokens.add(token);
  }

  async has(token: string): Promise<boolean> {
    return this.tokens.has(token);
  }
}

describe('RefreshUseCase', () => {
  const jwtStrategy = new FakeJwtStrategy();
  const blacklist = new FakeBlacklist();
  const useCase = new RefreshUseCase(jwtStrategy, blacklist);

  beforeEach(() => {
    blacklist.tokens.clear();
  });

  it('issues a new access token for valid refresh token', async () => {
    const result = await useCase.execute('valid-refresh');
    expect(result.success).toBe(true);
    expect(result.data.accessToken).toBe('signed-access-1');
    expect(result.data.refreshToken).toBe('valid-refresh');
    expect(result.data.expiresInSeconds).toBe(15 * 60);
  });

  it('rejects non-refresh tokens', async () => {
    await expect(useCase.execute('access-token')).rejects.toThrow('Missing or invalid authentication');
  });

  it('rejects blacklisted refresh tokens', async () => {
    await blacklist.add('valid-refresh');
    await expect(useCase.execute('valid-refresh')).rejects.toThrow('Missing or invalid authentication');
  });

  it('rejects invalid tokens', async () => {
    await expect(useCase.execute('invalid')).rejects.toThrow('Missing or invalid authentication');
  });
});
