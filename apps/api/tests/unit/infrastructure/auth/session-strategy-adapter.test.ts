import { SessionStrategyAdapter } from '../../../../src/infrastructure/auth/session-strategy-adapter';

describe('SessionStrategyAdapter', () => {
  const adapter = new SessionStrategyAdapter();

  it('creates and verifies a session token', async () => {
    const token = await adapter.create('candidate-1');
    const verified = await adapter.verify(token);
    expect(verified.userId).toBe('candidate-1');
  });

  it('revokes a session token', async () => {
    const token = await adapter.create('candidate-2');
    await adapter.revoke(token);
    await expect(adapter.verify(token)).rejects.toThrow('Invalid session token');
  });

  it('rejects an invalid session token', async () => {
    await expect(adapter.verify('invalid-token')).rejects.toThrow('Invalid session token');
  });
});
