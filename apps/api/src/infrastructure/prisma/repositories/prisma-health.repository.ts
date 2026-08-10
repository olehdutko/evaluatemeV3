import { Injectable } from '@nestjs/common';
import { IHealthRepository, HealthCheckResult } from '@evaluateme/domain';
import { PrismaService } from '../prisma.service';

@Injectable()
export class PrismaHealthRepository implements IHealthRepository {
  constructor(private readonly prisma: PrismaService) {}

  async check(): Promise<HealthCheckResult> {
    const start = Date.now();
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return {
        status: 'ok',
        database: 'ok',
        latencyMs: Date.now() - start,
        timestamp: new Date().toISOString(),
      };
    } catch {
      return {
        status: 'ok',
        database: 'error',
        latencyMs: Date.now() - start,
        timestamp: new Date().toISOString(),
      };
    }
  }
}
