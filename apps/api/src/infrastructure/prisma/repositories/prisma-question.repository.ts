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

  async save(_question: Question): Promise<Question> {
    throw new Error('Method not implemented.');
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
      type: row.type as 'single' | 'multiple',
      orderIndex: row.orderIndex,
      score: row.score,
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
    };
  }
}
