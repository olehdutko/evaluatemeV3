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

  async findByQuestionSetId(questionSetId: string): Promise<Question[]> {
    const rows = await this.prisma.question.findMany({
      where: questionSetId ? { questionSetId } : {},
      orderBy: { orderIndex: 'asc' },
    });
    return rows.map((row) => this.mapRow(row));
  }

  async findById(id: string): Promise<Question | null> {
    const row = await this.prisma.question.findUnique({ where: { id } });
    return row ? this.mapRow(row) : null;
  }

  async countByQuestionSetId(questionSetId: string): Promise<number> {
    return this.prisma.question.count({ where: { questionSetId } });
  }

  async findByQuestionSetIdRandomized(questionSetId: string, limit: number): Promise<Question[]> {
    const rows = await this.prisma.$queryRaw<Array<{
      id: string;
      questionSetId: string;
      content: string;
      type: string;
      orderIndex: number;
      score: number;
      createdAt: Date;
      updatedAt: Date;
    }>>`
      SELECT * FROM questions WHERE questionSetId = ${questionSetId} ORDER BY RAND() LIMIT ${limit}
    `;
    return rows.map((row) => this.mapRow(row));
  }

  async save(question: Question): Promise<Question> {
    const row = await this.prisma.question.upsert({
      where: { id: question.id },
      create: {
        id: question.id,
        questionSetId: question.questionSetId,
        content: question.content,
        type: question.type === 'multiple' ? 'multiple_choice' : 'single_choice',
        orderIndex: question.orderIndex,
        score: question.score,
      },
      update: {
        questionSetId: question.questionSetId,
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
    questionSetId: string;
    content: string;
    type: string;
    orderIndex: number;
    score: number;
    createdAt: Date;
    updatedAt: Date;
  }): Question {
    return {
      id: row.id,
      questionSetId: row.questionSetId,
      content: row.content,
      type: row.type === 'multiple_choice' ? 'multiple' : 'single',
      orderIndex: row.orderIndex,
      score: row.score,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }
}
