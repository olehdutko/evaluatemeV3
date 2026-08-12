import { Inject, Injectable } from '@nestjs/common';
import { ITechnologyRepository, IQuestionRepository, IAnswerRepository } from '@evaluateme/domain';
import { NotFoundError } from '../../../infrastructure/errors/app-error';

@Injectable()
export class GetTechnologyWithQuestionsUseCase {
  constructor(
    @Inject(ITechnologyRepository) private readonly technologyRepository: ITechnologyRepository,
    @Inject(IQuestionRepository) private readonly questionRepository: IQuestionRepository,
    @Inject(IAnswerRepository) private readonly answerRepository: IAnswerRepository,
  ) {}

  async execute(id: string): Promise<{
    success: true;
    data: {
      id: string;
      name: string;
      slug: string;
      description: string | null;
      questions: Array<{
        id: string;
        content: string;
        type: 'single' | 'multiple';
        orderIndex: number;
        score: number;
        answers: Array<{ id: string; content: string; isCorrect: boolean; orderIndex: number }>;
      }>;
    };
  }> {
    const technology = await this.technologyRepository.findById(id);
    if (!technology) {
      throw new NotFoundError('Technology', id);
    }

    const questions = await this.questionRepository.findByTechnologyId(id);
    const answers = await this.answerRepository.findByQuestionIds(questions.map((q) => q.id));
    const questionsWithAnswers = questions.map((question) => ({
      id: question.id,
      content: question.content,
      type: question.type,
      orderIndex: question.orderIndex,
      score: question.score,
      answers: answers
        .filter((a) => a.questionId === question.id)
        .map((a) => ({ id: a.id, content: a.content, isCorrect: a.isCorrect, orderIndex: a.orderIndex }))
        .sort((a, b) => a.orderIndex - b.orderIndex),
    }));

    return {
      success: true,
      data: {
        id: technology.id,
        name: technology.name,
        slug: technology.slug,
        description: technology.description,
        questions: questionsWithAnswers,
      },
    };
  }
}
