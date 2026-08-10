import { Entity } from './base.entity';

export interface TokenBlacklistEntry extends Entity {
  tokenHash: string;
  expiresAt: Date | null;
}
