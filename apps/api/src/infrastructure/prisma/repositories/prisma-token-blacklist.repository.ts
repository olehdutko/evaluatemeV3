import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { createHash } from 'crypto';
import { PrismaService } from '../prisma.service';
import { ITokenBlacklist } from '@evaluateme/domain';

const CLEANUP_INTERVAL_MS = 60 * 60 * 1000; // 1 hour

@Injectable()
export class PrismaTokenBlacklist implements ITokenBlacklist, OnModuleDestroy {
  private readonly cleanupInterval: ReturnType<typeof setInterval>;

  constructor(private readonly prisma: PrismaService) {
    this.cleanupInterval = setInterval(() => {
      void this.removeExpired();
    }, CLEANUP_INTERVAL_MS);
  }

  async add(token: string, expiresAt?: number): Promise<void> {
    const tokenHash = this.hashToken(token);
    const expiresDate = expiresAt ? new Date(expiresAt * 1000) : null;
    await this.prisma.tokenBlacklist.upsert({
      where: { tokenHash },
      create: { tokenHash, expiresAt: expiresDate },
      update: { expiresAt: expiresDate },
    });
  }

  async has(token: string): Promise<boolean> {
    const tokenHash = this.hashToken(token);
    const entry = await this.prisma.tokenBlacklist.findUnique({
      where: { tokenHash },
    });
    if (!entry) {
      return false;
    }
    if (entry.expiresAt && entry.expiresAt < new Date()) {
      await this.prisma.tokenBlacklist.delete({ where: { tokenHash } }).catch(() => null);
      return false;
    }
    return true;
  }

  onModuleDestroy(): void {
    clearInterval(this.cleanupInterval);
  }

  private hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  private async removeExpired(): Promise<void> {
    await this.prisma.tokenBlacklist.deleteMany({
      where: { expiresAt: { lt: new Date() } },
    });
  }
}
