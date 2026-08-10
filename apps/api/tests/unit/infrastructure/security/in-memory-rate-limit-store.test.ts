import { InMemoryRateLimitStore } from '../../../../src/infrastructure/security/in-memory-rate-limit-store';

describe('InMemoryRateLimitStore', () => {
  let store: InMemoryRateLimitStore;

  beforeEach(() => {
    store = new InMemoryRateLimitStore();
  });

  it('increments count within a window', async () => {
    const record = await store.record('ip-1', 60_000, 5);
    expect(record.count).toBe(1);
    const second = await store.record('ip-1', 60_000, 5);
    expect(second.count).toBe(2);
  });

  it('resets window after it expires', async () => {
    const windowMs = 50;
    await store.record('ip-1', windowMs, 5);
    await new Promise((resolve) => setTimeout(resolve, windowMs + 10));
    const record = await store.record('ip-1', windowMs, 5);
    expect(record.count).toBe(1);
  });

  it('returns null when peeking expired window', async () => {
    const windowMs = 50;
    await store.record('ip-1', windowMs, 5);
    await new Promise((resolve) => setTimeout(resolve, windowMs + 10));
    await expect(store.peek('ip-1', windowMs)).resolves.toBeNull();
  });

  it('resets counter for a key', async () => {
    await store.record('ip-1', 60_000, 5);
    await store.reset('ip-1');
    await expect(store.peek('ip-1', 60_000)).resolves.toBeNull();
  });
});
