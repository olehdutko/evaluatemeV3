import { Inject, Injectable } from '@nestjs/common';
import { ITechnologyRepository, ITestRepository, IQuestionRepository, IAnswerRepository } from '@evaluateme/domain';
import { NotFoundError } from '../../../infrastructure/errors/app-error';

@Injectable()
export class GetTechnologyWithQuestionsUseCase {
  constructor(
    @Inject(ITechnologyRepository) private readonly technologyRepository: ITechnologyRepository,
    @Inject(ITestRepository) private readonly testRepository: ITestRepository,
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
      tests: Array<{
        id: string;
        title: string;
        status: string;
        durationMinutes: number | null;
        passingScore: number | null;
        questions: Array<{
          id: string;
          content: string;
          type: 'single' | 'multiple';
          orderIndex: number;
          score: number;
          answers: Array<{ id: string; content: string; isCorrect: boolean; orderIndex: number }>;
        }>;
      }>;
    };
  }> {
    const technology = await this.technologyRepository.findById(id);
    if (!technology) {
      throw new NotFoundError('Technology', id);
    }

    const tests = await this.testRepository.findByTechnologyId(id);
    const testsWithQuestions = await Promise.all(
      tests.map(async (test) => {
        const questions = await this.questionRepository.findByTestId(test.id);
        const answers = await this.answerRepository.findByQuestionIds(questions.map((q) => q.id));
        return {
          id: test.id,
          title: test.title,
          status: test.status,
          durationMinutes: test.durationMinutes ?? null,
          passingScore: test.passingScore ?? null,
          questions: questions.map((question) => ({
            id: question.id,
            content: question.content,
            type: question.type,
            orderIndex: question.orderIndex,
            score: question.score,
            answers: answers
              .filter((a) => a.questionId === question.id)
              .map((a) => ({ id: a.id, content: a.content, isCorrect: a.isCorrect, orderIndex: a.orderIndex }))
              .sort((a, b) => a.orderIndex - b.orderIndex),
          })),
        };
      }),
    );

    return {
      success: true,
      data: {
        id: technology.id,
        name: technology.name,
        slug: technology.slug,
        description: technology.description,
        tests: testsWithQuestions,
      },
    };
  }
}
