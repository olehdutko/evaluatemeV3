import { Inject, Injectable } from '@nestjs/common';
import { IAnswerRepository } from '@evaluateme/domain';
import { NotFoundError } from '../../../infrastructure/errors/app-error';

@Injectable()
export class DeleteAnswerUseCase {
  constructor(@Inject(IAnswerRepository) private readonly answerRepository: IAnswerRepository) {}

  async execute(id: string): Promise<{ success: true }> {
    const existing = await this.answerRepository.findById(id);
    if (!existing) {
      throw new NotFoundError('Answer', id);
    }

    await this.answerRepository.delete(id);

    return { success: true };
  }
}
