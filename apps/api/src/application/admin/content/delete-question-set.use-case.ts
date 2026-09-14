import { Inject, Injectable } from '@nestjs/common';
import { IQuestionSetRepository, IQuestionSetRepository as IQuestionSetRepoType } from '@evaluateme/domain';
import { NotFoundError } from '../../../infrastructure/errors/app-error';

@Injectable()
export class DeleteQuestionSetUseCase {
  constructor(@Inject(IQuestionSetRepository) private readonly questionSetRepository: IQuestionSetRepoType) {}

  async execute(id: string): Promise<{ success: true }> {
    const existing = await this.questionSetRepository.findById(id);
    if (!existing) {
      throw new NotFoundError('QuestionSet', id);
    }

    await this.questionSetRepository.delete(id);

    return { success: true };
  }
}
