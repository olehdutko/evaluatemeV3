import { Controller, Post, Body, Req, Res, HttpCode, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';
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

const ACCESS_TOKEN_COOKIE = 'access_token';
const REFRESH_TOKEN_COOKIE = 'refresh_token';
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
};

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
  async login(
    @Body(new ZodValidationPipe(loginRequestSchema)) body: { email: string; password: string },
    @Res({ passthrough: true }) response: Response,
  ) {
    const result = await this.loginUseCase.execute(body);
    response.cookie(ACCESS_TOKEN_COOKIE, result.data.accessToken, {
      ...COOKIE_OPTIONS,
      maxAge: result.data.expiresInSeconds * 1000,
    });
    response.cookie(REFRESH_TOKEN_COOKIE, result.data.refreshToken, {
      ...COOKIE_OPTIONS,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    return { success: true, data: { expiresInSeconds: result.data.expiresInSeconds } };
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(
    @Body(new ZodValidationPipe(refreshRequestSchema)) body: { refreshToken: string },
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const refreshToken = body.refreshToken || request.cookies[REFRESH_TOKEN_COOKIE] || '';
    const result = await this.refreshUseCase.execute(refreshToken);
    response.cookie(ACCESS_TOKEN_COOKIE, result.data.accessToken, {
      ...COOKIE_OPTIONS,
      maxAge: result.data.expiresInSeconds * 1000,
    });
    return { success: true, data: { expiresInSeconds: result.data.expiresInSeconds } };
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(
    @Body(new ZodValidationPipe(logoutRequestSchema)) body: { refreshToken: string },
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const refreshToken = body.refreshToken || request.cookies[REFRESH_TOKEN_COOKIE] || '';
    if (refreshToken) {
      await this.logoutUseCase.execute(refreshToken);
    }
    response.clearCookie(ACCESS_TOKEN_COOKIE, COOKIE_OPTIONS);
    response.clearCookie(REFRESH_TOKEN_COOKIE, COOKIE_OPTIONS);
    return { success: true };
  }
}
