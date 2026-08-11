import { Injectable } from '@nestjs/common';
import { GoogleOAuthConfig } from './google-oauth.config';

interface GoogleTokens {
  access_token: string;
  id_token?: string;
}

interface GoogleUserinfo {
  id: string;
  email: string;
  verified_email: boolean;
  name?: string;
  picture?: string;
}

@Injectable()
export class GoogleOAuthService {
  constructor(private readonly config: GoogleOAuthConfig) {}

  buildAuthorizeUrl(state: string): string {
    const params = new URLSearchParams({
      client_id: this.config.clientId,
      redirect_uri: this.config.redirectUri,
      response_type: 'code',
      scope: 'openid email profile',
      access_type: 'offline',
      state,
    });
    return `${this.config.authorizeUrl}?${params.toString()}`;
  }

  async exchangeCode(code: string): Promise<GoogleTokens> {
    const params = new URLSearchParams({
      client_id: this.config.clientId,
      client_secret: this.config.clientSecret,
      code,
      redirect_uri: this.config.redirectUri,
      grant_type: 'authorization_code',
    });

    const response = await fetch(this.config.tokenUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    });

    if (!response.ok) {
      throw new Error(`Google token exchange failed: ${response.status}`);
    }

    return (await response.json()) as GoogleTokens;
  }

  async fetchUserinfo(accessToken: string): Promise<GoogleUserinfo> {
    const response = await fetch(this.config.userinfoUrl, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!response.ok) {
      throw new Error(`Google userinfo failed: ${response.status}`);
    }

    return (await response.json()) as GoogleUserinfo;
  }
}
