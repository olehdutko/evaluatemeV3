import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { RegisterUseCase } from '../../application/auth/register.use-case';
import { LoginUseCase } from '../../application/auth/login.use-case';
import { RefreshUseCase } from '../../application/auth/refresh.use-case';
import { LogoutUseCase } from '../../application/auth/logout.use-case';
import { ZodValidationPipe } from '../../infrastructure/validation/zod-validation.pipe';
import {
  loginRequestSchema,
  registerRequestSchema,
  refreshRequestSchema,
  logoutRequestSchema,
} from '../../lib/schemas/auth.schema';

@Controller('/api/v1/auth')
export class AuthController {
  constructor(
    private readonly registerUseCase: RegisterUseCase,
    private readonly loginUseCase: LoginUseCase,
    private readonly refreshUseCase: RefreshUseCase,
    private readonly logoutUseCase: LogoutUseCase,
  ) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body(new ZodValidationPipe(registerRequestSchema)) body: { email: string; password: string; role: 'user' | 'company' | 'admin' }) {
    return this.registerUseCase.execute(body);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body(new ZodValidationPipe(loginRequestSchema)) body: { email: string; password: string }) {
    return this.loginUseCase.execute(body);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(@Body(new ZodValidationPipe(refreshRequestSchema)) body: { refreshToken: string }) {
    return this.refreshUseCase.execute(body.refreshToken);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Body(new ZodValidationPipe(logoutRequestSchema)) body: { refreshToken: string }) {
    await this.logoutUseCase.execute(body.refreshToken);
    return { success: true };
  }
}
