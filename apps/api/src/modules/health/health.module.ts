import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HealthController } from './health.controller';
import { HealthCheckUseCase } from '../../application/health/health-check.use-case';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { PrismaHealthRepository } from '../../infrastructure/prisma/repositories/prisma-health.repository';
import { IHealthRepository } from '@evaluateme/domain';

@Module({
  imports: [ConfigModule],
  controllers: [HealthController],
  providers: [
    PrismaService,
    HealthCheckUseCase,
    {
      provide: IHealthRepository,
      useClass: PrismaHealthRepository,
    },
  ],
})
export class HealthModule {}
