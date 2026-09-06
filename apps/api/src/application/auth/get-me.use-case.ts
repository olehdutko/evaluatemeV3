import { Inject, Injectable } from '@nestjs/common';
import { IUserRepository } from '@evaluateme/domain';
import { UnauthorizedError } from '../../infrastructure/errors/app-error';

export interface AuthMeDto {
  id: string;
  email: string;
  username: string | null;
  role: string;
  credits: number;
  companyId: string | null;
  firstName: string | null;
  lastName: string | null;
  middleName: string | null;
  birthDate: string | null;
  country: string | null;
  city: string | null;
  phone: string | null;
}

function isPersonalProfileField(_role: string): boolean {
  // Admins configure the application and do not maintain personal profiles or credits.
  return _role !== 'admin';
}

@Injectable()
export class GetMeUseCase {
  constructor(
    @Inject(IUserRepository) private readonly userRepository: IUserRepository,
  ) {}

  async execute(userId: string): Promise<{ success: true; data: AuthMeDto }> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new UnauthorizedError();
    }

    const includePersonalFields = isPersonalProfileField(user.role);

    return {
      success: true,
      data: {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
        credits: includePersonalFields ? user.credits : 0,
        companyId: user.companyProfileId,
        firstName: includePersonalFields ? user.firstName : null,
        lastName: includePersonalFields ? user.lastName : null,
        middleName: includePersonalFields ? user.middleName : null,
        birthDate: includePersonalFields
          ? (user.birthDate ? user.birthDate.toISOString().split('T')[0] : null)
          : null,
        country: includePersonalFields ? user.country : null,
        city: includePersonalFields ? user.city : null,
        phone: includePersonalFields ? user.phone : null,
      },
    };
  }
}
