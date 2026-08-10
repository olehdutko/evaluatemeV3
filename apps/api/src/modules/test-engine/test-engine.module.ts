import { Module } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { PrismaTechnologyRepository } from '../../infrastructure/prisma/repositories/prisma-technology.repository';
import { PrismaQuestionRepository } from '../../infrastructure/prisma/repositories/prisma-question.repository';
import { PrismaAnswerRepository } from '../../infrastructure/prisma/repositories/prisma-answer.repository';
import { PrismaTestSessionRepository } from '../../infrastructure/prisma/repositories/prisma-test-session.repository';
import { StartTestUseCase } from '../../application/test-engine/start-test.use-case';
import { SubmitAnswerUseCase } from '../../application/test-engine/submit-answer.use-case';
import { GetTestSessionUseCase } from '../../application/test-engine/get-test-session.use-case';
import { TestEngineController } from './test-engine.controller';
import { JwtAuthGuard } from '../../infrastructure/auth/jwt-auth.guard';
import { JwtStrategyAdapter } from '../../infrastructure/auth/jwt-strategy-adapter';
import {
  ITechnologyRepository,
  IQuestionRepository,
  IAnswerRepository,
  ITestSessionRepository,
} from '@evaluateme/domain';

@Module({
  controllers: [TestEngineController],
  providers: [
    PrismaService,
    StartTestUseCase,
    SubmitAnswerUseCase,
    GetTestSessionUseCase,
    JwtAuthGuard,
    JwtStrategyAdapter,
    { provide: ITechnologyRepository, useClass: PrismaTechnologyRepository },
    { provide: IQuestionRepository, useClass: PrismaQuestionRepository },
    { provide: IAnswerRepository, useClass: PrismaAnswerRepository },
    { provide: ITestSessionRepository, useClass: PrismaTestSessionRepository },
  ],
})
export class TestEngineModule {}
