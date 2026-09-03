import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { IPasswordResetTokenRepository, PasswordResetToken } from '@evaluateme/domain';

@Injectable()
export class PrismaPasswordResetTokenRepository implements IPasswordResetTokenRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByTokenHash(tokenHash: string): Promise<PasswordResetToken | null> {
    const row = await this.prisma.passwordResetToken.findUnique({ where: { tokenHash } });
    return row ? this.toDomain(row) : null;
  }

  async save(token: PasswordResetToken): Promise<PasswordResetToken> {
    const saved = await this.prisma.passwordResetToken.upsert({
      where: { id: token.id },
      create: {
        id: token.id,
        userId: token.userId,
        tokenHash: token.tokenHash,
        expiresAt: token.expiresAt,
        usedAt: token.usedAt,
      },
      update: {
        userId: token.userId,
        tokenHash: token.tokenHash,
        expiresAt: token.expiresAt,
        usedAt: token.usedAt,
      },
    });
    return this.toDomain(saved);
  }

  private toDomain(raw: unknown): PasswordResetToken {
    const data = raw as Record<string, unknown>;
    return {
      id: data.id as string,
      userId: data.userId as string,
      tokenHash: data.tokenHash as string,
      expiresAt: data.expiresAt as Date,
      usedAt: (data.usedAt as Date | null) ?? null,
      createdAt: data.createdAt as Date,
      updatedAt: data.updatedAt as Date,
    };
  }
}
