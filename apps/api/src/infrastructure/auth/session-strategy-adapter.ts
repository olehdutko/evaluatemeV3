import { Injectable } from '@nestjs/common';
import { randomBytes } from 'crypto';
import { ISessionStrategy } from '@evaluateme/domain';

interface SessionRecord {
  userId: string;
  createdAt: Date;
}

@Injectable()
export class SessionStrategyAdapter implements ISessionStrategy {
  private readonly sessions = new Map<string, SessionRecord>();
  private readonly ttlMs = 1000 * 60 * 60 * 24 * 7; // 7 days

  async create(userId: string): Promise<string> {
    const token = randomBytes(32).toString('hex');
    this.sessions.set(token, { userId, createdAt: new Date() });
    return token;
  }

  async verify(token: string): Promise<{ userId: string }> {
    const record = this.sessions.get(token);
    if (!record) {
      throw new Error('Invalid session token');
    }
    if (Date.now() - record.createdAt.getTime() > this.ttlMs) {
      this.sessions.delete(token);
      throw new Error('Session expired');
    }
    return { userId: record.userId };
  }

  async revoke(token: string): Promise<void> {
    this.sessions.delete(token);
  }
}
