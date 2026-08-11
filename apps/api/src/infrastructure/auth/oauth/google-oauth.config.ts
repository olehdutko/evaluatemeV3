import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GoogleOAuthConfig {
  constructor(private readonly config: ConfigService) {}

  get clientId(): string {
    return this.config.getOrThrow<string>('GOOGLE_CLIENT_ID');
  }

  get clientSecret(): string {
    return this.config.getOrThrow<string>('GOOGLE_CLIENT_SECRET');
  }

  get redirectUri(): string {
    const apiUrl = this.config.get<string>('API_URL') ?? 'http://localhost:3001';
    return `${apiUrl}/api/v1/auth/google/callback`;
  }

  get frontendRedirectUrl(): string {
    return this.config.get<string>('FRONTEND_URL') ?? 'http://localhost:3000/technologies';
  }

  get authorizeUrl(): string {
    return 'https://accounts.google.com/o/oauth2/v2/auth';
  }

  get tokenUrl(): string {
    return 'https://oauth2.googleapis.com/token';
  }

  get userinfoUrl(): string {
    return 'https://www.googleapis.com/oauth2/v2/userinfo';
  }
}
