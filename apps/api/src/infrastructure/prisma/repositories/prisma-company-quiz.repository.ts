import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import {
  ICompanyQuizRepository,
  CompanyQuiz,
  CompanyQuizQuestion,
  CompanyQuizAnswer,
  CustomQuizQuestion,
} from '@evaluateme/domain';

@Injectable()
export class PrismaCompanyQuizRepository implements ICompanyQuizRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<CompanyQuiz | null> {
    const row = await this.prisma.companyQuiz.findUnique({ where: { id } });
    return row ? this.toDomain(row) : null;
  }

  async findByCompanyId(companyId: string): Promise<CompanyQuiz[]> {
    const rows = await this.prisma.companyQuiz.findMany({
      where: { companyId },
      orderBy: { createdAt: 'desc' },
    });
    return rows.map((row) => this.toDomain(row));
  }

  async save(
    quiz: CompanyQuiz,
    questions: CustomQuizQuestion[] | CompanyQuizQuestion[],
    answers?: CompanyQuizAnswer[],
  ): Promise<CompanyQuiz> {
    const isPersonal = quiz.type === 'personal';

    await this.prisma.$transaction(async (tx) => {
      await tx.companyQuiz.upsert({
        where: { id: quiz.id },
        create: {
          id: quiz.id,
          companyId: quiz.companyId,
          type: quiz.type,
          name: quiz.name,
          description: quiz.description,
          status: quiz.status,
          createdByUserId: quiz.createdByUserId,
        },
        update: {
          companyId: quiz.companyId,
          type: quiz.type,
          name: quiz.name,
          description: quiz.description,
          status: quiz.status,
          createdByUserId: quiz.createdByUserId,
        },
      });

      if (isPersonal) {
        await tx.companyQuizQuestion.deleteMany({ where: { companyQuizId: quiz.id } });
        const personalQuestions = questions as CompanyQuizQuestion[];
        for (const q of personalQuestions) {
          await tx.companyQuizQuestion.create({
            data: {
              id: q.id,
              companyQuizId: q.companyQuizId,
              content: q.content,
              type: q.type,
              orderIndex: q.orderIndex,
              score: q.score,
            },
          });
        }
        if (answers && answers.length > 0) {
          await tx.companyQuizAnswer.deleteMany({
            where: { companyQuizQuestionId: { in: personalQuestions.map((q) => q.id) } },
          });
          for (const a of answers) {
            await tx.companyQuizAnswer.create({
              data: {
                id: a.id,
                companyQuizQuestionId: a.companyQuizQuestionId,
                content: a.content,
                isCorrect: a.isCorrect,
                orderIndex: a.orderIndex,
              },
            });
          }
        }
      } else {
        await tx.customQuizQuestion.deleteMany({ where: { companyQuizId: quiz.id } });
        const customQuestions = questions as CustomQuizQuestion[];
        for (const q of customQuestions) {
          await tx.customQuizQuestion.create({
            data: {
              id: q.id,
              companyQuizId: q.companyQuizId,
              questionId: q.questionId,
              orderIndex: q.orderIndex,
            },
          });
        }
      }
    });

    return quiz;
  }

  private toDomain(raw: unknown): CompanyQuiz {
    const data = raw as Record<string, unknown>;
    return {
      id: data.id as string,
      companyId: data.companyId as string,
      type: data.type as 'custom' | 'personal',
      name: data.name as string,
      description: (data.description as string | null) ?? null,
      status: data.status as 'draft' | 'published' | 'archived',
      createdByUserId: data.createdByUserId as string,
      createdAt: data.createdAt as Date,
      updatedAt: data.updatedAt as Date,
    };
  }
}
