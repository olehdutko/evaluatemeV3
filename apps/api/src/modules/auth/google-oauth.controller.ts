import { Controller, Get, Query, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { OAuthLoginUseCase } from '../../application/auth/oauth-login.use-case';
import { GoogleOAuthService } from '../../infrastructure/auth/oauth/google-oauth.service';
import { GoogleOAuthConfig } from '../../infrastructure/auth/oauth/google-oauth.config';
import { RateLimit, RateLimitGuard } from '../../infrastructure/security/rate-limit.guard';
import { UserRole } from '@evaluateme/domain';

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
};

@Controller('/api/v1/auth/google')
@UseGuards(RateLimitGuard)
export class GoogleOAuthController {
  constructor(
    private readonly oauthService: GoogleOAuthService,
    private readonly oauthConfig: GoogleOAuthConfig,
    private readonly oauthLoginUseCase: OAuthLoginUseCase,
  ) {}

  @Get()
  @RateLimit({ limit: 10, windowMs: 60 * 1000 })
  initiate(@Query('role') role: string, @Res() response: Response) {
    const allowedRole: UserRole = role === 'company' ? 'company' : 'user';
    const state = Buffer.from(JSON.stringify({ role: allowedRole })).toString('base64url');
    const url = this.oauthService.buildAuthorizeUrl(state);
    response.redirect(url);
  }

  @Get('callback')
  @RateLimit({ limit: 10, windowMs: 60 * 1000 })
  async callback(
    @Query('code') code: string,
    @Query('state') state: string,
    @Query('error') error: string | undefined,
    @Res() response: Response,
  ) {
    if (error) {
      return response.redirect(`${this.oauthConfig.frontendRedirectUrl}?error=oauth_denied`);
    }

    let role: UserRole = 'user';
    try {
      const parsed = JSON.parse(Buffer.from(state, 'base64url').toString('utf8')) as { role?: UserRole };
      role = parsed.role === 'company' ? 'company' : 'user';
    } catch {
      role = 'user';
    }

    try {
      const tokens = await this.oauthService.exchangeCode(code);
      const userinfo = await this.oauthService.fetchUserinfo(tokens.access_token);

      const result = await this.oauthLoginUseCase.execute({
        email: userinfo.email,
        role,
      });

      response.cookie('access_token', result.data.accessToken, {
        ...COOKIE_OPTIONS,
        maxAge: result.data.expiresInSeconds * 1000,
      });
      response.cookie('refresh_token', result.data.refreshToken, {
        ...COOKIE_OPTIONS,
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      return response.redirect(this.oauthConfig.frontendRedirectUrl);
    } catch {
      return response.redirect(`${this.oauthConfig.frontendRedirectUrl}?error=oauth_failed`);
    }
  }
}
