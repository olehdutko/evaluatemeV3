import { Module } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { PrismaTechnologyRepository } from '../../infrastructure/prisma/repositories/prisma-technology.repository';
import { PrismaQuestionRepository } from '../../infrastructure/prisma/repositories/prisma-question.repository';
import { PrismaAnswerRepository } from '../../infrastructure/prisma/repositories/prisma-answer.repository';
import { PrismaQuizSessionRepository } from '../../infrastructure/prisma/repositories/prisma-quiz-session.repository';
import { PrismaAccessCodeRepository } from '../../infrastructure/prisma/repositories/prisma-access-code.repository';
import { PrismaUserRepository } from '../../infrastructure/prisma/repositories/prisma-user.repository';
import {
  PrismaUserResultRepository,
  PrismaCandidateResultRepository,
} from '../../infrastructure/prisma/repositories/prisma-session-result.repository';
import { StartTestUseCase } from '../../application/test-engine/start-test.use-case';
import { SubmitAnswerUseCase } from '../../application/test-engine/submit-answer.use-case';
import { GetTestSessionUseCase } from '../../application/test-engine/get-test-session.use-case';
import { StartSessionUseCase } from '../../application/test-engine/start-session.use-case';
import { TestEngineController } from './test-engine.controller';
import { SessionsController } from './sessions.controller';
import { AuthModule } from '../auth/auth.module';
import {
  ITechnologyRepository,
  IQuestionRepository,
  IAnswerRepository,
  IQuizSessionRepository,
  IAccessCodeRepository,
  IUserRepository,
  IUserResultRepository,
  ICandidateResultRepository,
} from '@evaluateme/domain';

@Module({
  imports: [AuthModule],
  controllers: [TestEngineController, SessionsController],
  providers: [
    PrismaService,
    StartTestUseCase,
    SubmitAnswerUseCase,
    GetTestSessionUseCase,
    StartSessionUseCase,
    { provide: ITechnologyRepository, useClass: PrismaTechnologyRepository },
    { provide: IQuestionRepository, useClass: PrismaQuestionRepository },
    { provide: IAnswerRepository, useClass: PrismaAnswerRepository },
    { provide: IQuizSessionRepository, useClass: PrismaQuizSessionRepository },
    { provide: IAccessCodeRepository, useClass: PrismaAccessCodeRepository },
    { provide: IUserRepository, useClass: PrismaUserRepository },
    { provide: IUserResultRepository, useClass: PrismaUserResultRepository },
    { provide: ICandidateResultRepository, useClass: PrismaCandidateResultRepository },
  ],
})
export class TestEngineModule {}
