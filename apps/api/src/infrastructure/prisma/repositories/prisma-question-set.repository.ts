import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { IQuestionSetRepository, QuestionSet } from '@evaluateme/domain';

@Injectable()
export class PrismaQuestionSetRepository implements IQuestionSetRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<QuestionSet | null> {
    const row = await this.prisma.questionSet.findUnique({ where: { id } });
    return row ? this.mapRow(row) : null;
  }

  async findByTechnologyId(technologyId: string): Promise<QuestionSet[]> {
    const rows = await this.prisma.questionSet.findMany({
      where: { technologyId },
      orderBy: { createdAt: 'asc' },
    });
    return rows.map((row) => this.mapRow(row));
  }

  async findByTechnologyIdAndTitle(technologyId: string, title: string): Promise<QuestionSet | null> {
    const row = await this.prisma.questionSet.findUnique({
      where: { technologyId_title: { technologyId, title } },
    });
    return row ? this.mapRow(row) : null;
  }

  async save(questionSet: QuestionSet): Promise<QuestionSet> {
    const row = await this.prisma.questionSet.upsert({
      where: { id: questionSet.id },
      create: {
        id: questionSet.id,
        title: questionSet.title,
        technologyId: questionSet.technologyId,
        status: questionSet.status,
        description: questionSet.description,
        quizQuestionCount: questionSet.quizQuestionCount,
        quizDurationMinutes: questionSet.quizDurationMinutes,
        createdByUserId: questionSet.createdByUserId,
      },
      update: {
        title: questionSet.title,
        technologyId: questionSet.technologyId,
        status: questionSet.status,
        description: questionSet.description,
        quizQuestionCount: questionSet.quizQuestionCount,
        quizDurationMinutes: questionSet.quizDurationMinutes,
        createdByUserId: questionSet.createdByUserId,
      },
    });
    return this.mapRow(row);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.questionSet.delete({ where: { id } });
  }

  private mapRow(row: {
    id: string;
    title: string;
    technologyId: string;
    status: string;
    description: string | null;
    quizQuestionCount: number;
    quizDurationMinutes: number;
    createdByUserId: string;
    createdAt: Date;
    updatedAt: Date;
  }): QuestionSet {
    return {
      id: row.id,
      title: row.title,
      technologyId: row.technologyId,
      status: row.status === 'active' ? 'active' : 'suspended',
      description: row.description,
      quizQuestionCount: row.quizQuestionCount,
      quizDurationMinutes: row.quizDurationMinutes,
      createdByUserId: row.createdByUserId,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }
}
