import { Inject, Injectable } from '@nestjs/common';
import { IUserRepository, UserRole } from '@evaluateme/domain';
import { ForbiddenError, NotFoundError } from '../../infrastructure/errors/app-error';

@Injectable()
export class GetAdminMeUseCase {
  constructor(@Inject(IUserRepository) private readonly userRepository: IUserRepository) {}

  async execute(userId: string): Promise<{ success: true; data: { id: string; email: string; role: string } }> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError('User', userId);
    }
    if (user.role !== UserRole.ADMIN) {
      throw new ForbiddenError();
    }
    return { success: true, data: { id: user.id, email: user.email, role: user.role } };
  }
}
