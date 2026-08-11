import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { IAnswerRepository, Answer } from '@evaluateme/domain';

@Injectable()
export class PrismaAnswerRepository implements IAnswerRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByQuestionId(questionId: string): Promise<Answer[]> {
    const rows = await this.prisma.answer.findMany({
      where: { questionId },
      orderBy: { orderIndex: 'asc' },
    });
    return rows.map(this.mapRow);
  }

  async findById(id: string): Promise<Answer | null> {
    const row = await this.prisma.answer.findUnique({ where: { id } });
    return row ? this.mapRow(row) : null;
  }

  async findByQuestionIds(questionIds: string[]): Promise<Answer[]> {
    const rows = await this.prisma.answer.findMany({
      where: { questionId: { in: questionIds } },
      orderBy: { orderIndex: 'asc' },
    });
    return rows.map(this.mapRow);
  }

  async save(answer: Answer): Promise<Answer> {
    const row = await this.prisma.answer.upsert({
      where: { id: answer.id },
      create: {
        id: answer.id,
        questionId: answer.questionId,
        content: answer.content,
        isCorrect: answer.isCorrect,
        orderIndex: answer.orderIndex,
      },
      update: {
        content: answer.content,
        isCorrect: answer.isCorrect,
        orderIndex: answer.orderIndex,
      },
    });
    return this.mapRow(row);
  }

  private mapRow(row: {
    id: string;
    questionId: string;
    content: string;
    isCorrect: boolean;
    orderIndex: number;
    createdAt: Date;
  }): Answer {
    return {
      id: row.id,
      questionId: row.questionId,
      content: row.content,
      isCorrect: row.isCorrect,
      orderIndex: row.orderIndex,
      createdAt: row.createdAt,
      updatedAt: row.createdAt,
    };
  }
}
