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
import { AuthModule } from '../auth/auth.module';
import {
  ITechnologyRepository,
  IQuestionRepository,
  IAnswerRepository,
  ITestSessionRepository,
} from '@evaluateme/domain';

@Module({
  imports: [AuthModule],
  controllers: [TestEngineController],
  providers: [
    PrismaService,
    StartTestUseCase,
    SubmitAnswerUseCase,
    GetTestSessionUseCase,
    { provide: ITechnologyRepository, useClass: PrismaTechnologyRepository },
    { provide: IQuestionRepository, useClass: PrismaQuestionRepository },
    { provide: IAnswerRepository, useClass: PrismaAnswerRepository },
    { provide: ITestSessionRepository, useClass: PrismaTestSessionRepository },
  ],
})
export class TestEngineModule {}
