import {
  saveTokens,
  getTokens,
  clearTokens,
  isTokenExpired,
  AuthTokens,
} from '../../../../src/lib/auth/token-storage';

describe('token-storage', () => {
  const tokens: AuthTokens = {
    accessToken: 'access',
    refreshToken: 'refresh',
    expiresAt: Date.now() + 5 * 60 * 1000,
  };

  beforeEach(() => {
    clearTokens();
  });

  it('saves and retrieves tokens', () => {
    saveTokens(tokens);
    expect(getTokens()).toEqual(tokens);
  });

  it('clears tokens', () => {
    saveTokens(tokens);
    clearTokens();
    expect(getTokens()).toBeNull();
  });

  it('detects expired tokens', () => {
    const expired: AuthTokens = { ...tokens, expiresAt: Date.now() - 1000 };
    expect(isTokenExpired(expired)).toBe(true);
  });

  it('detects valid tokens', () => {
    const valid: AuthTokens = { ...tokens, expiresAt: Date.now() + 5 * 60 * 1000 };
    expect(isTokenExpired(valid)).toBe(false);
  });
});
