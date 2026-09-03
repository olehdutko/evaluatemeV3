import { Entity } from './base.entity';

export interface PasswordResetToken extends Entity {
  userId: string;
  tokenHash: string;
  expiresAt: Date;
  usedAt: Date | null;
}
