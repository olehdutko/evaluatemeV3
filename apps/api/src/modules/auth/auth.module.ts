import { Module } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { PrismaUserRepository } from '../../infrastructure/prisma/repositories/prisma-user.repository';
import { BcryptPasswordHasher } from '../../infrastructure/security/bcrypt-password-hasher';
import { JwtStrategyAdapter } from '../../infrastructure/auth/jwt-strategy-adapter';
import { SessionStrategyAdapter } from '../../infrastructure/auth/session-strategy-adapter';
import { PrismaTokenBlacklist } from '../../infrastructure/prisma/repositories/prisma-token-blacklist.repository';
import { JwtAuthGuard } from '../../infrastructure/auth/jwt-auth.guard';
import { RolesGuard } from '../../infrastructure/security/roles.guard';
import { LogSecurityEventUseCase } from '../../application/security/log-security-event.use-case';
import { ConsoleSecurityAuditLogger } from '../../infrastructure/security/security-audit-logger';
import { InMemoryRateLimitStore } from '../../infrastructure/security/in-memory-rate-limit-store';
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
  ISecurityAuditLogger,
  IRateLimitStore,
} from '@evaluateme/domain';

@Module({
  controllers: [AuthController],
  providers: [
    PrismaService,
    RegisterUseCase,
    LoginUseCase,
    RefreshUseCase,
    LogoutUseCase,
    LogSecurityEventUseCase,
    JwtAuthGuard,
    RolesGuard,
    { provide: IUserRepository, useClass: PrismaUserRepository },
    { provide: ISecurityAuditLogger, useClass: ConsoleSecurityAuditLogger },
    { provide: IRateLimitStore, useClass: InMemoryRateLimitStore },
    { provide: IPasswordHasher, useClass: BcryptPasswordHasher },
    { provide: IJwtStrategy, useClass: JwtStrategyAdapter },
    { provide: ISessionStrategy, useClass: SessionStrategyAdapter },
    { provide: ITokenBlacklist, useClass: PrismaTokenBlacklist },
  ],
  exports: [JwtAuthGuard, IJwtStrategy, ISessionStrategy, RolesGuard, LogSecurityEventUseCase],
})
export class AuthModule {}
