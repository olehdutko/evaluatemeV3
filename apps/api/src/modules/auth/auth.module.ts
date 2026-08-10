import { Module } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { PrismaUserRepository } from '../../infrastructure/prisma/repositories/prisma-user.repository';
import { BcryptPasswordHasher } from '../../infrastructure/security/bcrypt-password-hasher';
import { JwtStrategyAdapter } from '../../infrastructure/auth/jwt-strategy-adapter';
import { SessionStrategyAdapter } from '../../infrastructure/auth/session-strategy-adapter';
import { InMemoryTokenBlacklist } from '../../infrastructure/auth/in-memory-token-blacklist';
import { JwtAuthGuard } from '../../infrastructure/auth/jwt-auth.guard';
import { RegisterUseCase } from '../../application/auth/register.use-case';
import { LoginUseCase } from '../../application/auth/login.use-case';
import { RefreshUseCase } from '../../application/auth/refresh.use-case';
import { LogoutUseCase } from '../../application/auth/logout.use-case';
import { AuthController } from './auth.controller';
import {
  IUserRepository,
  IPasswordHasher,
  IJwtStrategy,
  ISessionStrategy,
  ITokenBlacklist,
} from '@evaluateme/domain';

@Module({
  controllers: [AuthController],
  providers: [
    PrismaService,
    RegisterUseCase,
    LoginUseCase,
    RefreshUseCase,
    LogoutUseCase,
    JwtAuthGuard,
    { provide: IUserRepository, useClass: PrismaUserRepository },
    { provide: IPasswordHasher, useClass: BcryptPasswordHasher },
    { provide: IJwtStrategy, useClass: JwtStrategyAdapter },
    { provide: ISessionStrategy, useClass: SessionStrategyAdapter },
    { provide: ITokenBlacklist, useClass: InMemoryTokenBlacklist },
  ],
  exports: [JwtAuthGuard],
})
export class AuthModule {}
