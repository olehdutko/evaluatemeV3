import { Inject, Injectable } from '@nestjs/common';
import { ITechnologyRepository } from '@evaluateme/domain';
import { NotFoundError } from '../../../infrastructure/errors/app-error';

@Injectable()
export class DeleteTechnologyUseCase {
  constructor(@Inject(ITechnologyRepository) private readonly repository: ITechnologyRepository) {}

  async execute(id: string): Promise<{ success: true }> {
    const existing = await this.repository.findById(id);
    if (!existing) {
      throw new NotFoundError('Technology', id);
    }

    await this.repository.delete(id);

    return { success: true };
  }
}
