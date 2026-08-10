import { LogoutUseCase } from '../../../../src/application/auth/logout.use-case';
import { IJwtStrategy, ITokenBlacklist, ITokenPayload } from '@evaluateme/domain';

class FakeJwtStrategy implements IJwtStrategy {
  async sign(_payload: ITokenPayload, _expiresIn?: string): Promise<string> {
    return 'token';
  }

  async verify(token: string): Promise<ITokenPayload> {
    if (token === 'valid-refresh') {
      return { sub: '1', email: 'a@b.com', role: 'user', type: 'refresh', exp: Date.now() / 1000 + 3600 };
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

describe('LogoutUseCase', () => {
  const jwtStrategy = new FakeJwtStrategy();
  const blacklist = new FakeBlacklist();
  const useCase = new LogoutUseCase(jwtStrategy, blacklist);

  it('blacklists a valid refresh token', async () => {
    await useCase.execute('valid-refresh');
    expect(blacklist.tokens.has('valid-refresh')).toBe(true);
  });

  it('rejects an access token', async () => {
    await expect(useCase.execute('access-token')).rejects.toThrow('Invalid token type');
  });

  it('rejects an invalid token', async () => {
    await expect(useCase.execute('invalid')).rejects.toThrow('Invalid refresh token');
  });
});
