import { Injectable } from '@nestjs/common';
import { IRateLimitStore, RateLimitRecord } from '@evaluateme/domain';

interface WindowState {
  count: number;
  resetAt: number;
}

@Injectable()
export class InMemoryRateLimitStore implements IRateLimitStore {
  private readonly windows = new Map<string, WindowState>();

  async record(key: string, windowMs: number, _limit: number): Promise<RateLimitRecord> {
    const now = Date.now();
    let state = this.windows.get(key);
    if (!state || state.resetAt <= now) {
      state = { count: 0, resetAt: now + windowMs };
      this.windows.set(key, state);
    }
    state.count += 1;
    return { count: state.count, windowStart: state.resetAt - windowMs, resetAt: state.resetAt };
  }

  async peek(key: string, windowMs: number): Promise<RateLimitRecord | null> {
    const now = Date.now();
    const state = this.windows.get(key);
    if (!state || state.resetAt <= now) {
      return null;
    }
    return { count: state.count, windowStart: state.resetAt - windowMs, resetAt: state.resetAt };
  }

  async reset(key: string): Promise<void> {
    this.windows.delete(key);
  }
}
