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

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  issueSessionToken(candidateId: string, accessCodeId: string, _expiresInMinutes: number): Promise<string> {
    const token = randomBytes(32).toString('hex');
    const payload: ITokenPayload = {
      sub: candidateId,
      type: 'session',
      email: `candidate+${accessCodeId}@evaluateme.local`,
      role: 'candidate',
    };
    this.sessions.set(token, { payload, createdAt: new Date() });
    return Promise.resolve(token);
  }

  verifySessionToken(token: string): Promise<ITokenPayload | null> {
    const record = this.sessions.get(token);
    if (!record) {
      return Promise.resolve(null);
    }
    return Promise.resolve(record.payload);
  }

  revokeSessionToken(token: string): Promise<void> {
    this.sessions.delete(token);
    return Promise.resolve();
  }
}
