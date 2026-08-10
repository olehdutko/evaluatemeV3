import { Injectable, Inject } from '@nestjs/common';
import { IHealthRepository, HealthCheckResult } from '@evaluateme/domain';
import { Logger, createLogger } from '../../infrastructure/logging/logger';

@Injectable()
export class HealthCheckUseCase {
  private readonly logger: Logger;

  constructor(
    @Inject(IHealthRepository) private readonly healthRepository: IHealthRepository,
  ) {
    this.logger = createLogger('HealthCheckUseCase');
  }

  async execute(): Promise<{ success: true; data: HealthCheckResult }> {
    const dbCheck = await this.healthRepository.check();
    this.logger.debug('Health check executed', {
      database: dbCheck.database,
      latencyMs: dbCheck.latencyMs,
    });
    return {
      success: true,
      data: dbCheck,
    };
  }
}
