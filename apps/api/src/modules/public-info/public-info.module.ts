import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PublicInfoController } from './public-info.controller';
import { PublicResultController } from './public-result.controller';
import { GetPublicInfoUseCase } from '../../application/public-info/get-public-info.use-case';
import { GetPublicResultByCodeUseCase } from '../../application/public-info/get-public-result-by-code.use-case';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { PrismaCreditSettingRepository } from '../../infrastructure/prisma/repositories/prisma-credit-setting.repository';
import { PrismaHealthRepository } from '../../infrastructure/prisma/repositories/prisma-health.repository';
import { PrismaTechnologyRepository } from '../../infrastructure/prisma/repositories/prisma-technology.repository';
import { PrismaUserRepository } from '../../infrastructure/prisma/repositories/prisma-user.repository';
import { PrismaQuestionRepository } from '../../infrastructure/prisma/repositories/prisma-question.repository';
import { PrismaQuizSessionRepository } from '../../infrastructure/prisma/repositories/prisma-quiz-session.repository';
import {
  ICreditSettingRepository,
  IHealthRepository,
  ITechnologyRepository,
  IUserRepository,
  IQuestionRepository,
  IQuizSessionRepository,
} from '@evaluateme/domain';

@Module({
  imports: [ConfigModule],
  controllers: [PublicInfoController, PublicResultController],
  providers: [
    PrismaService,
    GetPublicInfoUseCase,
    GetPublicResultByCodeUseCase,
    { provide: ICreditSettingRepository, useClass: PrismaCreditSettingRepository },
    { provide: IHealthRepository, useClass: PrismaHealthRepository },
    { provide: ITechnologyRepository, useClass: PrismaTechnologyRepository },
    { provide: IUserRepository, useClass: PrismaUserRepository },
    { provide: IQuestionRepository, useClass: PrismaQuestionRepository },
    { provide: IQuizSessionRepository, useClass: PrismaQuizSessionRepository },
  ],
})
export class PublicInfoModule {}
