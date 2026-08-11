import { Inject, Injectable } from '@nestjs/common';
import { IUserRepository } from '@evaluateme/domain';

@Injectable()
export class ListUsersUseCase {
  constructor(@Inject(IUserRepository) private readonly repository: IUserRepository) {}

  async execute(): Promise<{
    success: true;
    data: Array<{
      id: string;
      email: string;
      role: string;
      activationStatus: string;
      createdAt: string;
      updatedAt: string;
    }>;
  }> {
    const rows = await this.repository.findAll();
    return {
      success: true,
      data: rows.map((row) => ({
        id: row.id,
        email: row.email,
        role: row.role,
        activationStatus: row.activationStatus,
        createdAt: row.createdAt.toISOString(),
        updatedAt: row.updatedAt.toISOString(),
      })),
    };
  }
}
