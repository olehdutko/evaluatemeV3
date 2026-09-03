import { Inject, Injectable } from '@nestjs/common';
import {
  IUserRepository,
  IJwtStrategy,
  ITokenPayload,
  AuthTokens,
  UserRole,
  ActivationStatus,
} from '@evaluateme/domain';
import { ConflictError } from '../../infrastructure/errors/app-error';

const ACCESS_TOKEN_EXPIRY_SECONDS = 15 * 60;
const REFRESH_TOKEN_EXPIRY_SECONDS = 7 * 24 * 60 * 60;

@Injectable()
export class OAuthLoginUseCase {
  constructor(
    @Inject(IUserRepository) private readonly userRepository: IUserRepository,
    @Inject(IJwtStrategy) private readonly jwtStrategy: IJwtStrategy,
  ) {}

  async execute(input: {
    email: string;
    role: UserRole;
  }): Promise<{ success: true; data: AuthTokens }> {
    if (input.role === UserRole.ADMIN) {
      throw new ConflictError('Admin login is not available via OAuth.');
    }

    let user = await this.userRepository.findByEmail(input.email);

    if (!user) {
      const now = new Date();
      user = await this.userRepository.save({
        id: crypto.randomUUID(),
        email: input.email,
        username: null,
        passwordHash: null,
        legacyMd5Hash: null,
        role: input.role,
        activationStatus: ActivationStatus.ACTIVE,
        companyProfileId: null,
        credits: 0,
        firstName: null,
        lastName: null,
        middleName: null,
        birthDate: null,
        country: null,
        city: null,
        phone: null,
        createdAt: now,
        updatedAt: now,
      });
    }

    if (user.activationStatus === ActivationStatus.SUSPENDED) {
      throw new ConflictError('Account is suspended.');
    }

    const payload: ITokenPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      type: 'access',
    };

    const accessToken = await this.jwtStrategy.sign(payload, `${ACCESS_TOKEN_EXPIRY_SECONDS}s`);
    const refreshToken = await this.jwtStrategy.sign(
      { ...payload, type: 'refresh' },
      `${REFRESH_TOKEN_EXPIRY_SECONDS}s`,
    );

    return {
      success: true,
      data: {
        accessToken,
        refreshToken,
        expiresInSeconds: ACCESS_TOKEN_EXPIRY_SECONDS,
      },
    };
  }
}
