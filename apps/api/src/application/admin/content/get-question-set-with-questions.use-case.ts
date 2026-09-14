import { Inject, Injectable } from '@nestjs/common';
import { IQuestionSetRepository, IQuestionRepository, IAnswerRepository } from '@evaluateme/domain';
import { NotFoundError } from '../../../infrastructure/errors/app-error';

@Injectable()
export class GetQuestionSetWithQuestionsUseCase {
  constructor(
    @Inject(IQuestionSetRepository) private readonly questionSetRepository: IQuestionSetRepository,
    @Inject(IQuestionRepository) private readonly questionRepository: IQuestionRepository,
    @Inject(IAnswerRepository) private readonly answerRepository: IAnswerRepository,
  ) {}

  async execute(id: string): Promise<{
    success: true;
    data: {
      id: string;
      title: string;
      technologyId: string;
      status: 'active' | 'suspended';
      quizQuestionCount: number;
      quizDurationMinutes: number;
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
    const questionSet = await this.questionSetRepository.findById(id);
    if (!questionSet) {
      throw new NotFoundError('QuestionSet', id);
    }

    const questions = await this.questionRepository.findByQuestionSetId(id);
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
        id: questionSet.id,
        title: questionSet.title,
        technologyId: questionSet.technologyId,
        status: questionSet.status,
        quizQuestionCount: questionSet.quizQuestionCount,
        quizDurationMinutes: questionSet.quizDurationMinutes,
        questions: questionsWithAnswers,
      },
    };
  }
}
