import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { IQuestionRepository, Question } from '@evaluateme/domain';

@Injectable()
export class PrismaQuestionRepository implements IQuestionRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<Question[]> {
    const rows = await this.prisma.question.findMany({ orderBy: { createdAt: 'desc' } });
    return rows.map((row) => this.mapRow(row));
  }

  async findByTechnologyId(technologyId: string): Promise<Question[]> {
    const rows = await this.prisma.question.findMany({
      where: technologyId ? { technologyId } : {},
      orderBy: { orderIndex: 'asc' },
    });
    return rows.map(this.mapRow);
  }

  async findById(id: string): Promise<Question | null> {
    const row = await this.prisma.question.findUnique({ where: { id } });
    return row ? this.mapRow(row) : null;
  }

  async findByTechnologyIdRandomized(technologyId: string, limit: number): Promise<Question[]> {
    const rows = await this.prisma.$queryRaw<Array<{
      id: string;
      technologyId: string;
      content: string;
      type: string;
      orderIndex: number;
      score: number;
      createdAt: Date;
      updatedAt: Date;
    }>>`
      SELECT * FROM questions WHERE technologyId = ${technologyId} ORDER BY RAND() LIMIT ${limit}
    `;
    return rows.map(this.mapRow);
  }

  async save(question: Question): Promise<Question> {
    const row = await this.prisma.question.upsert({
      where: { id: question.id },
      create: {
        id: question.id,
        technologyId: question.technologyId,
        content: question.content,
        type: question.type === 'multiple' ? 'multiple_choice' : 'single_choice',
        orderIndex: question.orderIndex,
        score: question.score,
      },
      update: {
        technologyId: question.technologyId,
        content: question.content,
        type: question.type === 'multiple' ? 'multiple_choice' : 'single_choice',
        orderIndex: question.orderIndex,
        score: question.score,
      },
    });
    return this.mapRow(row);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.answer.deleteMany({ where: { questionId: id } });
    await this.prisma.question.delete({ where: { id } });
  }

  private mapRow(row: {
    id: string;
    technologyId: string;
    content: string;
    type: string;
    orderIndex: number;
    score: number;
    createdAt: Date;
    updatedAt: Date;
  }): Question {
    return {
      id: row.id,
      technologyId: row.technologyId,
      content: row.content,
      type: row.type === 'multiple_choice' ? 'multiple' : 'single',
      orderIndex: row.orderIndex,
      score: row.score,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }
}
