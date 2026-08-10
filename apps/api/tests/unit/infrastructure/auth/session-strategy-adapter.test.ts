import { SessionStrategyAdapter } from '../../../../src/infrastructure/auth/session-strategy-adapter';

describe('SessionStrategyAdapter', () => {
  const adapter = new SessionStrategyAdapter();

  it('issues and verifies a session token', async () => {
    const token = await adapter.issueSessionToken('candidate-1', 'ac-1', 60);
    const verified = await adapter.verifySessionToken(token);
    expect(verified?.sub).toBe('candidate-1');
    expect(verified?.type).toBe('session');
  });

  it('revokes a session token', async () => {
    const token = await adapter.issueSessionToken('candidate-2', 'ac-2', 60);
    await adapter.revokeSessionToken(token);
    await expect(adapter.verifySessionToken(token)).resolves.toBeNull();
  });

  it('rejects an invalid session token', async () => {
    await expect(adapter.verifySessionToken('invalid-token')).resolves.toBeNull();
  });
});
