import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { TechnologiesController } from './technologies.controller';
import { ListTechnologiesUseCase } from '../../application/technologies/list-technologies.use-case';
import { GetTechnologyUseCase } from '../../application/technologies/get-technology.use-case';
import { GetTechnologyPreviewUseCase } from '../../application/technologies/get-technology-preview.use-case';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { PrismaTechnologyRepository } from '../../infrastructure/prisma/repositories/prisma-technology.repository';
import { PrismaQuestionRepository } from '../../infrastructure/prisma/repositories/prisma-question.repository';
import { PrismaAnswerRepository } from '../../infrastructure/prisma/repositories/prisma-answer.repository';
import { PrismaCreditSettingRepository } from '../../infrastructure/prisma/repositories/prisma-credit-setting.repository';
import {
  ITechnologyRepository,
  IQuestionRepository,
  IAnswerRepository,
  ICreditSettingRepository,
} from '@evaluateme/domain';

@Module({
  imports: [AuthModule],
  controllers: [TechnologiesController],
  providers: [
    PrismaService,
    ListTechnologiesUseCase,
    GetTechnologyUseCase,
    GetTechnologyPreviewUseCase,
    {
      provide: ITechnologyRepository,
      useClass: PrismaTechnologyRepository,
    },
    {
      provide: IQuestionRepository,
      useClass: PrismaQuestionRepository,
    },
    {
      provide: IAnswerRepository,
      useClass: PrismaAnswerRepository,
    },
    {
      provide: ICreditSettingRepository,
      useClass: PrismaCreditSettingRepository,
    },
  ],
})
export class TechnologiesModule {}
