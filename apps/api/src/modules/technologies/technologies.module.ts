import { Module } from '@nestjs/common';
import { TechnologiesController } from './technologies.controller';
import { ListTechnologiesUseCase } from '../../application/technologies/list-technologies.use-case';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { PrismaTechnologyRepository } from '../../infrastructure/prisma/repositories/prisma-technology.repository';
import { ITechnologyRepository } from '@evaluateme/domain';

@Module({
  controllers: [TechnologiesController],
  providers: [
    PrismaService,
    ListTechnologiesUseCase,
    {
      provide: ITechnologyRepository,
      useClass: PrismaTechnologyRepository,
    },
  ],
})
export class TechnologiesModule {}
