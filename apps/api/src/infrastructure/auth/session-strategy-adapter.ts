import { Injectable } from '@nestjs/common';
import { randomBytes } from 'crypto';
import { ISessionStrategy, ITokenPayload } from '@evaluateme/domain';

interface SessionRecord {
  payload: ITokenPayload;
  createdAt: Date;
}

@Injectable()
export class SessionStrategyAdapter implements ISessionStrategy {
  private readonly sessions = new Map<string, SessionRecord>();

  async issueSessionToken(candidateId: string, accessCodeId: string, _expiresInMinutes: number): Promise<string> {
    const token = randomBytes(32).toString('hex');
    const payload: ITokenPayload = {
      sub: candidateId,
      type: 'session',
      email: `candidate+${accessCodeId}@evaluateme.local`,
      role: 'candidate',
    };
    this.sessions.set(token, { payload, createdAt: new Date() });
    return token;
  }

  async verifySessionToken(token: string): Promise<ITokenPayload | null> {
    const record = this.sessions.get(token);
    if (!record) {
      return null;
    }
    const ttlMs = 1000 * 60 * 60 * 24 * 7; // 7 days default
    if (Date.now() - record.createdAt.getTime() > ttlMs) {
      this.sessions.delete(token);
      return null;
    }
    return record.payload;
  }

  async revokeSessionToken(token: string): Promise<void> {
    this.sessions.delete(token);
  }
}
