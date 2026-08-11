import { Inject, Injectable } from '@nestjs/common';
import { IUserRepository, UserRole, ActivationStatus } from '@evaluateme/domain';
import { NotFoundError, BadRequestError, ConflictError } from '../../../infrastructure/errors/app-error';

export interface UpdateUserInput {
  id: string;
  role?: UserRole;
  activationStatus?: ActivationStatus;
}

@Injectable()
export class UpdateUserUseCase {
  constructor(@Inject(IUserRepository) private readonly repository: IUserRepository) {}

  async execute(input: UpdateUserInput): Promise<{
    success: true;
    data: {
      id: string;
      email: string;
      role: string;
      activationStatus: string;
      updatedAt: string;
    };
  }> {
    const existing = await this.repository.findById(input.id);
    if (!existing) {
      throw new NotFoundError('User', input.id);
    }

    if (input.role === UserRole.ADMIN && existing.role !== UserRole.ADMIN) {
      // Prevent accidentally promoting users to admin through this UI; use CLI for admin creation.
      throw new ConflictError('Promoting to admin must be done via the create-admin CLI.');
    }
    if (input.role !== undefined && !Object.values(UserRole).includes(input.role)) {
      throw new BadRequestError({ role: ['Invalid role'] });
    }
    if (input.activationStatus !== undefined && !Object.values(ActivationStatus).includes(input.activationStatus)) {
      throw new BadRequestError({ activationStatus: ['Invalid activation status'] });
    }

    const saved = await this.repository.save({
      ...existing,
      role: input.role ?? existing.role,
      activationStatus: input.activationStatus ?? existing.activationStatus,
      updatedAt: new Date(),
    });

    return {
      success: true,
      data: {
        id: saved.id,
        email: saved.email,
        role: saved.role,
        activationStatus: saved.activationStatus,
        updatedAt: saved.updatedAt.toISOString(),
      },
    };
  }
}
