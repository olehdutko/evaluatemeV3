export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresInSeconds: number;
}

export interface ITokenPayload {
  sub: string;
  email: string;
  role: 'user' | 'company' | 'admin';
  type: 'access' | 'refresh' | 'session';
  iat?: number;
  exp?: number;
}

export interface IJwtStrategy {
  sign(payload: ITokenPayload, expiresIn?: string): Promise<string>;
  verify(token: string): Promise<ITokenPayload>;
}

export const IJwtStrategy = Symbol('IJwtStrategy');

export interface ISessionStrategy {
  create(userId: string): Promise<string>;
  verify(token: string): Promise<{ userId: string }>;
  revoke(token: string): Promise<void>;
}

export const ISessionStrategy = Symbol('ISessionStrategy');

export interface ITokenBlacklist {
  add(token: string, expiresAt?: number): Promise<void>;
  has(token: string): Promise<boolean>;
}

export const ITokenBlacklist = Symbol('ITokenBlacklist');
