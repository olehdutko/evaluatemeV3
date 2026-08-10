export const IJwtStrategy = Symbol('IJwtStrategy');

export interface ITokenPayload {
  sub: string;
  email?: string;
  role?: string;
  type: 'access' | 'refresh' | 'session';
}

export interface IJwtStrategy {
  sign(payload: ITokenPayload, expiresIn?: string): Promise<string>;
  verify(token: string): Promise<ITokenPayload>;
}
