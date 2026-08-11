import { Inject, Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { IQuestionRepository, IAnswerRepository, Answer } from '@evaluateme/domain';
import { BadRequestError, UnprocessableError } from '../../../infrastructure/errors/app-error';

export interface SaveQuestionInput {
  id?: string;
  testId: string;
  content: string;
  type: 'single' | 'multiple';
  orderIndex: number;
  score: number;
  answers: Array<{ id?: string; content: string; isCorrect: boolean; orderIndex: number }>;
}

@Injectable()
export class SaveQuestionUseCase {
  constructor(
    @Inject(IQuestionRepository) private readonly questionRepository: IQuestionRepository,
    @Inject(IAnswerRepository) private readonly answerRepository: IAnswerRepository,
  ) {}

  async execute(input: SaveQuestionInput): Promise<{ success: true; data: { id: string; content: string; updatedAt: string } }> {
    const content = input.content.trim();
    if (!content) {
      throw new BadRequestError({ content: ['Question content is required'] });
    }
    if (!['single', 'multiple'].includes(input.type)) {
      throw new BadRequestError({ type: ['Question type must be single or multiple'] });
    }
    if (input.orderIndex < 0) {
      throw new BadRequestError({ orderIndex: ['Order index must be non-negative'] });
    }
    if (input.score <= 0) {
      throw new BadRequestError({ score: ['Score must be positive'] });
    }

    const answers = input.answers.map((a, index) => ({
      id: a.id ?? randomUUID(),
      questionId: '',
      content: a.content.trim(),
      isCorrect: a.isCorrect,
      orderIndex: a.orderIndex ?? index + 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));

    const correctCount = answers.filter((a) => a.isCorrect).length;
    if (correctCount === 0) {
      throw new UnprocessableError('At least one answer must be marked correct.');
    }
    if (input.type === 'single' && correctCount !== 1) {
      throw new UnprocessableError('Single-choice questions must have exactly one correct answer.');
    }
    if (answers.some((a) => !a.content)) {
      throw new BadRequestError({ answers: ['Answer content is required'] });
    }

    const questionId = input.id ?? randomUUID();
    const now = new Date();
    const savedQuestion = await this.questionRepository.save({
      id: questionId,
      testId: input.testId,
      content,
      type: input.type,
      orderIndex: input.orderIndex,
      score: input.score,
      createdAt: now,
      updatedAt: now,
    });

    await Promise.all(
      answers.map((a) =>
        this.answerRepository.save({
          ...a,
          questionId: savedQuestion.id,
        } as Answer),
      ),
    );

    return {
      success: true,
      data: {
        id: savedQuestion.id,
        content: savedQuestion.content,
        updatedAt: savedQuestion.updatedAt.toISOString(),
      },
    };
  }
}
