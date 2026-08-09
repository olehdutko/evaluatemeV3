import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { IHealthRepositoryPort } from '@evaluateme/domain';

@Injectable()
export class PrismaHealthRepository implements IHealthRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async checkDatabase(): Promise<{ ok: boolean; latencyMs: number }> {
    const start = Date.now();
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return { ok: true, latencyMs: Date.now() - start };
    } catch (error) {
      return { ok: false, latencyMs: Date.now() - start };
    }
  }
}
