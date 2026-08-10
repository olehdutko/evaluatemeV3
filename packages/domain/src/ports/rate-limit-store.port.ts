export const IRateLimitStore = Symbol('IRateLimitStore');

export interface RateLimitRecord {
  count: number;
  windowStart: number;
  resetAt: number;
}

export interface IRateLimitStore {
  /**
   * Records one request for the given key and returns the current window state.
   * If the window has expired, it is reset before incrementing.
   */
  record(key: string, windowMs: number, limit: number): Promise<RateLimitRecord>;

  /**
   * Returns the current window state without incrementing the counter.
   */
  peek(key: string, windowMs: number): Promise<RateLimitRecord | null>;

  /**
   * Resets the counter for a key. Useful for tests.
   */
  reset(key: string): Promise<void>;
}
