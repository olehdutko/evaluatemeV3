import { Injectable, Inject } from '@nestjs/common';
import { IHealthRepository, IHealthRepositoryPort } from '@evaluateme/domain';
import { Logger, createLogger } from '../../infrastructure/logging/logger';

@Injectable()
export class HealthCheckUseCase {
  private readonly logger: Logger;

  constructor(
    @Inject(IHealthRepository) private readonly healthRepository: IHealthRepositoryPort,
  ) {
    this.logger = createLogger('HealthCheckUseCase');
  }

  async execute(): Promise<{ success: true; data: { status: string; database: string; latencyMs: number; timestamp: string } }> {
    const dbCheck = await this.healthRepository.checkDatabase();
    this.logger.debug('Health check executed', { ok: dbCheck.ok, latencyMs: dbCheck.latencyMs });
    return {
      success: true,
      data: {
        status: 'ok',
        database: dbCheck.ok ? 'ok' : 'error',
        latencyMs: dbCheck.latencyMs,
        timestamp: new Date().toISOString(),
      },
    };
  }
}
