import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { NotFoundError } from '../../infrastructure/errors/app-error';

export interface PublicQuestionDetail {
  questionId: string;
  content: string;
  type: string;
  score: number;
  userAnswerContent: string;
  isCorrect: boolean;
}

export interface PublicResultDetail {
  resultCode: string;
  technologyId: string;
  technologyName: string;
  score: number | null;
  maxScore: number | null;
  status: string;
  createdAt: string;
  questions: PublicQuestionDetail[];
}

@Injectable()
export class GetPublicResultByCodeUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(resultCode: string): Promise<{ success: true; data: PublicResultDetail }> {
    const result = await this.prisma.userResult.findUnique({
      where: { resultCode },
    });

    if (!result) {
      throw new NotFoundError('result');
    }

    const technology = await this.prisma.technology.findUnique({
      where: { id: result.technologyId },
      select: { id: true, name: true },
    });

    const questions: PublicQuestionDetail[] = [];
    if (result.sessionId) {
      const rawAnswers = await this.prisma.userAnswer.findMany({
        where: { testSessionId: result.sessionId },
      });
      const questionIds = [...new Set(rawAnswers.map((a) => a.questionId))];
      const answerIds = [...new Set(rawAnswers.map((a) => a.answerId))];
      const questionRows = questionIds.length > 0
        ? await this.prisma.question.findMany({ where: { id: { in: questionIds } }, select: { id: true, content: true, type: true, score: true } })
        : [];
      const answerRows = answerIds.length > 0
        ? await this.prisma.answer.findMany({ where: { id: { in: answerIds } }, select: { id: true, content: true } })
        : [];
      const questionById = new Map(questionRows.map((q) => [q.id, q]));
      const answerById = new Map(answerRows.map((a) => [a.id, a]));

      for (const a of rawAnswers) {
        const q = questionById.get(a.questionId);
        const ans = answerById.get(a.answerId);
        questions.push({
          questionId: a.questionId,
          content: q?.content || '',
          type: q?.type || '',
          score: q?.score || 0,
          userAnswerContent: ans?.content || '',
          isCorrect: a.isCorrect,
        });
      }
    }

    return {
      success: true,
      data: {
        resultCode: result.resultCode,
        technologyId: result.technologyId,
        technologyName: technology?.name || 'Unknown',
        score: result.score,
        maxScore: result.maxScore,
        status: result.status,
        createdAt: result.createdAt.toISOString(),
        questions,
      },
    };
  }
}
