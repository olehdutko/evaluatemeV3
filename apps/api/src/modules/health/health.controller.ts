import { Controller, Get } from '@nestjs/common';
import { HealthCheckUseCase } from '../../application/health/health-check.use-case';

@Controller('/api/v1/health')
export class HealthController {
  constructor(private readonly healthCheckUseCase: HealthCheckUseCase) {}

  @Get()
  async check(): Promise<ReturnType<HealthCheckUseCase['execute']>> {
    return this.healthCheckUseCase.execute();
  }
}
