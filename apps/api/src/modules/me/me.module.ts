import { Module } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { AuthModule } from '../auth/auth.module';
import { MeController } from './me.controller';
import { GetMyResultsUseCase } from '../../application/me/get-my-results.use-case';
import { GetMyResultDetailUseCase } from '../../application/me/get-my-result-detail.use-case';

@Module({
  imports: [AuthModule],
  controllers: [MeController],
  providers: [PrismaService, GetMyResultsUseCase, GetMyResultDetailUseCase],
})
export class MeModule {}
