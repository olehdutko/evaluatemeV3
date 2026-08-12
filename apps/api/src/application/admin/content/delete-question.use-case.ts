import { Inject, Injectable } from '@nestjs/common';
import { IQuestionRepository } from '@evaluateme/domain';
import { NotFoundError } from '../../../infrastructure/errors/app-error';

@Injectable()
export class DeleteQuestionUseCase {
  constructor(@Inject(IQuestionRepository) private readonly questionRepository: IQuestionRepository) {}

  async execute(id: string): Promise<{ success: true }> {
    const existing = await this.questionRepository.findById(id);
    if (!existing) {
      throw new NotFoundError('Question', id);
    }

    await this.questionRepository.delete(id);

    return { success: true };
  }
}
