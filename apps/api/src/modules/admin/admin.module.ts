import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { AdminController } from './admin.controller';
import { GetAdminMeUseCase } from '../../application/admin/get-admin-me.use-case';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { PrismaUserRepository } from '../../infrastructure/prisma/repositories/prisma-user.repository';
import { IUserRepository } from '@evaluateme/domain';

@Module({
  imports: [AuthModule],
  controllers: [AdminController],
  providers: [
    PrismaService,
    GetAdminMeUseCase,
    { provide: IUserRepository, useClass: PrismaUserRepository },
  ],
})
export class AdminModule {}
