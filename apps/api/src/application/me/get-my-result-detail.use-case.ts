import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { NotFoundError, ForbiddenError } from '../../infrastructure/errors/app-error';

export interface QuestionDetail {
  questionId: string;
  content: string;
  type: string;
  score: number;
  userAnswerId: string;
  userAnswerContent: string;
  correctAnswerIds: string[];
  isCorrect: boolean;
}

export interface MyResultDetail {
  resultCode: string;
  technologyId: string;
  technologyName: string;
  score: number | null;
  maxScore: number | null;
  status: string;
  createdAt: string;
  questions: QuestionDetail[];
}

@Injectable()
export class GetMyResultDetailUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(userId: string, resultCode: string): Promise<{ success: true; data: MyResultDetail }> {
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
    const technologyName = technology?.name || 'Unknown';

    if (result.userId !== userId) {
      throw new ForbiddenError('This result does not belong to you.');
    }

    const sessionId = result.sessionId;
    if (!sessionId) {
      return {
        success: true,
        data: this.toDetail(result, technologyName, []),
      };
    }

    const rawAnswers = await this.prisma.userAnswer.findMany({
      where: { testSessionId: sessionId },
    });

    const questionIds = [...new Set(rawAnswers.map((a) => a.questionId))];
    const answerIds = [...new Set(rawAnswers.map((a) => a.answerId))];
    const questionRows = questionIds.length > 0
      ? await this.prisma.question.findMany({ where: { id: { in: questionIds } }, select: { id: true, content: true, type: true, score: true } })
      : [];
    const questionById = new Map(questionRows.map((q) => [q.id, q]));

    const answers = answerIds.length > 0
      ? await this.prisma.answer.findMany({ where: { id: { in: answerIds } }, select: { id: true, questionId: true, content: true, isCorrect: true } })
      : [];
    const answerById = new Map(answers.map((a) => [a.id, a]));

    const correctAnswers = questionIds.length > 0
      ? await this.prisma.answer.findMany({
          where: { questionId: { in: questionIds }, isCorrect: true },
          select: { id: true, questionId: true },
        })
      : [];
    const correctByQuestion = new Map<string, string[]>();
    for (const ans of correctAnswers) {
      const list = correctByQuestion.get(ans.questionId) || [];
      list.push(ans.id);
      correctByQuestion.set(ans.questionId, list);
    }

    const details: QuestionDetail[] = rawAnswers.map((a) => {
      const q = questionById.get(a.questionId);
      const ans = answerById.get(a.answerId);
      return {
        questionId: a.questionId,
        content: q?.content || '',
        type: q?.type || '',
        score: q?.score || 0,
        userAnswerId: a.answerId,
        userAnswerContent: ans?.content || '',
        correctAnswerIds: correctByQuestion.get(a.questionId) || [],
        isCorrect: a.isCorrect,
      };
    });

    return {
      success: true,
      data: this.toDetail(result, technologyName, details),
    };
  }

  private toDetail(result: Record<string, unknown>, technologyName: string, questions: QuestionDetail[]): MyResultDetail {
    return {
      resultCode: result.resultCode as string,
      technologyId: result.technologyId as string,
      technologyName,
      score: result.score as number | null,
      maxScore: result.maxScore as number | null,
      status: result.status as string,
      createdAt: (result.createdAt as Date).toISOString(),
      questions,
    };
  }
}
