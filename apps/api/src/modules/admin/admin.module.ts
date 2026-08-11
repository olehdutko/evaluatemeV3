import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { AdminController } from './admin.controller';
import { GetAdminMeUseCase } from '../../application/admin/get-admin-me.use-case';
import { GetCreditSettingsUseCase } from '../../application/admin/credit-settings/get-credit-settings.use-case';
import { UpdateCreditSettingUseCase } from '../../application/admin/credit-settings/update-credit-setting.use-case';
import { ListEmailTemplatesUseCase } from '../../application/admin/email-templates/list-email-templates.use-case';
import { GetEmailTemplateUseCase } from '../../application/admin/email-templates/get-email-template.use-case';
import { UpdateEmailTemplateUseCase } from '../../application/admin/email-templates/update-email-template.use-case';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { PrismaUserRepository } from '../../infrastructure/prisma/repositories/prisma-user.repository';
import { PrismaCreditSettingRepository } from '../../infrastructure/prisma/repositories/prisma-credit-setting.repository';
import { PrismaEmailTemplateRepository } from '../../infrastructure/prisma/repositories/prisma-email-template.repository';
import {
  IUserRepository,
  ICreditSettingRepository,
  IEmailTemplateRepository,
} from '@evaluateme/domain';

@Module({
  imports: [AuthModule],
  controllers: [AdminController],
  providers: [
    PrismaService,
    GetAdminMeUseCase,
    GetCreditSettingsUseCase,
    UpdateCreditSettingUseCase,
    ListEmailTemplatesUseCase,
    GetEmailTemplateUseCase,
    UpdateEmailTemplateUseCase,
    { provide: IUserRepository, useClass: PrismaUserRepository },
    { provide: ICreditSettingRepository, useClass: PrismaCreditSettingRepository },
    { provide: IEmailTemplateRepository, useClass: PrismaEmailTemplateRepository },
  ],
})
export class AdminModule {}
