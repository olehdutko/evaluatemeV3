import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { CampaignsController } from './campaigns.controller';
import { QuizzesController } from './quizzes.controller';
import { AccessCodesController } from './access-codes.controller';
import { ResultsController } from './results.controller';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { CreateCampaignUseCase } from '../../application/corporate/campaigns/create-campaign.use-case';
import { ListCampaignsUseCase } from '../../application/corporate/campaigns/list-campaigns.use-case';
import { UpdateCampaignStatusUseCase } from '../../application/corporate/campaigns/update-campaign-status.use-case';
import { GetCampaignUseCase } from '../../application/corporate/campaigns/get-campaign.use-case';
import { CreateCustomQuizUseCase } from '../../application/corporate/quizzes/create-custom-quiz.use-case';
import { CreatePersonalQuizUseCase } from '../../application/corporate/quizzes/create-personal-quiz.use-case';
import { ListCompanyQuizzesUseCase } from '../../application/corporate/quizzes/list-company-quizzes.use-case';
import { CreateAccessCodeUseCase } from '../../application/corporate/access-codes/create-access-code.use-case';
import { ListAccessCodesUseCase } from '../../application/corporate/access-codes/list-access-codes.use-case';
import { SendAccessCodeUseCase } from '../../application/corporate/access-codes/send-access-code.use-case';
import { PreviewAccessCodeEmailUseCase } from '../../application/corporate/access-codes/preview-access-code-email.use-case';
import { ListCampaignResultsUseCase } from '../../application/corporate/results/list-campaign-results.use-case';
import { GetCandidateResultDetailUseCase } from '../../application/corporate/results/get-candidate-result-detail.use-case';
import { PrismaCampaignRepository } from '../../infrastructure/prisma/repositories/prisma-campaign.repository';
import { PrismaCompanyQuizRepository } from '../../infrastructure/prisma/repositories/prisma-company-quiz.repository';
import { PrismaAccessCodeRepository } from '../../infrastructure/prisma/repositories/prisma-access-code.repository';
import { PrismaCompanyProfileRepository } from '../../infrastructure/prisma/repositories/prisma-company-profile.repository';
import { PrismaUserRepository } from '../../infrastructure/prisma/repositories/prisma-user.repository';
import { PrismaQuestionRepository } from '../../infrastructure/prisma/repositories/prisma-question.repository';
import { PrismaQuestionSetRepository } from '../../infrastructure/prisma/repositories/prisma-question-set.repository';
import { PrismaAnswerRepository } from '../../infrastructure/prisma/repositories/prisma-answer.repository';
import { PrismaQuizSessionRepository } from '../../infrastructure/prisma/repositories/prisma-quiz-session.repository';
import {
  PrismaCandidateResultRepository,
} from '../../infrastructure/prisma/repositories/prisma-session-result.repository';
import { NodemailerEmailService } from '../../infrastructure/email/nodemailer-email.service';
import { ConsoleEmailService } from '../../infrastructure/email/console-email.service';
import { PrismaCreditSettingRepository } from '../../infrastructure/prisma/repositories/prisma-credit-setting.repository';
import { PrismaEmailTemplateRepository } from '../../infrastructure/prisma/repositories/prisma-email-template.repository';
import {
  ICampaignRepository,
  ICompanyQuizRepository,
  IAccessCodeRepository,
  ICompanyProfileRepository,
  IUserRepository,
  IQuestionSetRepository,
  IQuestionRepository,
  IAnswerRepository,
  ICandidateResultRepository,
  IEmailService,
  IQuizSessionRepository,
  ICreditSettingRepository,
  IEmailTemplateRepository,
} from '@evaluateme/domain';

@Module({
  imports: [AuthModule],
  controllers: [CampaignsController, QuizzesController, AccessCodesController, ResultsController],
  providers: [
    PrismaService,
    CreateCampaignUseCase,
    ListCampaignsUseCase,
    UpdateCampaignStatusUseCase,
    GetCampaignUseCase,
    CreateCustomQuizUseCase,
    CreatePersonalQuizUseCase,
    ListCompanyQuizzesUseCase,
    CreateAccessCodeUseCase,
    ListAccessCodesUseCase,
    SendAccessCodeUseCase,
    PreviewAccessCodeEmailUseCase,
    ListCampaignResultsUseCase,
    GetCandidateResultDetailUseCase,
    { provide: ICampaignRepository, useClass: PrismaCampaignRepository },
    { provide: ICompanyQuizRepository, useClass: PrismaCompanyQuizRepository },
    { provide: IAccessCodeRepository, useClass: PrismaAccessCodeRepository },
    { provide: ICompanyProfileRepository, useClass: PrismaCompanyProfileRepository },
    { provide: IUserRepository, useClass: PrismaUserRepository },
    { provide: IQuestionSetRepository, useClass: PrismaQuestionSetRepository },
    { provide: IQuestionRepository, useClass: PrismaQuestionRepository },
    { provide: IAnswerRepository, useClass: PrismaAnswerRepository },
    { provide: IQuizSessionRepository, useClass: PrismaQuizSessionRepository },
    { provide: ICandidateResultRepository, useClass: PrismaCandidateResultRepository },
    { provide: ICreditSettingRepository, useClass: PrismaCreditSettingRepository },
    { provide: IEmailTemplateRepository, useClass: PrismaEmailTemplateRepository },
    {
      provide: IEmailService,
      useClass: process.env.SMTP_HOST ? NodemailerEmailService : ConsoleEmailService,
    },
  ],
})
export class CorporateModule {}
