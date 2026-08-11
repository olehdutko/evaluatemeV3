import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { AdminController } from './admin.controller';
import { GetAdminMeUseCase } from '../../application/admin/get-admin-me.use-case';
import { GetCreditSettingsUseCase } from '../../application/admin/credit-settings/get-credit-settings.use-case';
import { UpdateCreditSettingUseCase } from '../../application/admin/credit-settings/update-credit-setting.use-case';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { PrismaUserRepository } from '../../infrastructure/prisma/repositories/prisma-user.repository';
import { PrismaCreditSettingRepository } from '../../infrastructure/prisma/repositories/prisma-credit-setting.repository';
import { IUserRepository, ICreditSettingRepository } from '@evaluateme/domain';

@Module({
  imports: [AuthModule],
  controllers: [AdminController],
  providers: [
    PrismaService,
    GetAdminMeUseCase,
    GetCreditSettingsUseCase,
    UpdateCreditSettingUseCase,
    { provide: IUserRepository, useClass: PrismaUserRepository },
    { provide: ICreditSettingRepository, useClass: PrismaCreditSettingRepository },
  ],
})
export class AdminModule {}
