import { PasswordResetToken } from '../entities/password-reset-token.entity';

export const IPasswordResetTokenRepository = Symbol('IPasswordResetTokenRepository');

export interface IPasswordResetTokenRepository {
  findByTokenHash(tokenHash: string): Promise<PasswordResetToken | null>;
  save(token: PasswordResetToken): Promise<PasswordResetToken>;
}
