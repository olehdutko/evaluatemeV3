import { ITokenPayload } from './jwt-strategy.port';

export const ISessionStrategy = Symbol('ISessionStrategy');

export interface ISessionStrategy {
  issueSessionToken(candidateId: string, accessCodeId: string, expiresInMinutes: number): Promise<string>;
  verifySessionToken(token: string): Promise<ITokenPayload | null>;
  revokeSessionToken(token: string): Promise<void>;
}
