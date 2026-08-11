import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { IQuestionRepository, Question } from '@evaluateme/domain';

@Injectable()
export class PrismaQuestionRepository implements IQuestionRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByTestId(testId: string): Promise<Question[]> {
    const rows = await this.prisma.question.findMany({
      where: { testId },
      orderBy: { orderIndex: 'asc' },
    });
    return rows.map(this.mapRow);
  }

  async findById(id: string): Promise<Question | null> {
    const row = await this.prisma.question.findUnique({ where: { id } });
    return row ? this.mapRow(row) : null;
  }

  async findByTestIdRandomized(testId: string, limit: number): Promise<Question[]> {
    const rows = await this.prisma.$queryRaw<Array<{
      id: string;
      testId: string;
      content: string;
      type: string;
      orderIndex: number;
      score: number;
      createdAt: Date;
      updatedAt: Date;
    }>>`
      SELECT * FROM questions WHERE testId = ${testId} ORDER BY RAND() LIMIT ${limit}
    `;
    return rows.map(this.mapRow);
  }

  async save(question: Question): Promise<Question> {
    const row = await this.prisma.question.upsert({
      where: { id: question.id },
      create: {
        id: question.id,
        testId: question.testId,
        content: question.content,
        type: question.type === 'multiple' ? 'multiple_choice' : 'single_choice',
        orderIndex: question.orderIndex,
        score: question.score,
      },
      update: {
        content: question.content,
        type: question.type === 'multiple' ? 'multiple_choice' : 'single_choice',
        orderIndex: question.orderIndex,
        score: question.score,
      },
    });
    return this.mapRow(row);
  }

  private mapRow(row: {
    id: string;
    testId: string;
    content: string;
    type: string;
    orderIndex: number;
    score: number;
    createdAt: Date;
    updatedAt: Date;
  }): Question {
    return {
      id: row.id,
      testId: row.testId,
      content: row.content,
      type: row.type === 'multiple_choice' ? 'multiple' : 'single',
      orderIndex: row.orderIndex,
      score: row.score,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }
}
