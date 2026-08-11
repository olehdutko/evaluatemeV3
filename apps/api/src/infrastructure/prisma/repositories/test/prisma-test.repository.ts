import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { ITestRepository, Test } from '@evaluateme/domain';

@Injectable()
export class PrismaTestRepository implements ITestRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<Test[]> {
    const rows = await this.prisma.test.findMany({ orderBy: { createdAt: 'desc' } });
    return rows.map((row) => this.toDomain(row));
  }

  async findById(id: string): Promise<Test | null> {
    const row = await this.prisma.test.findUnique({ where: { id } });
    return row ? this.toDomain(row) : null;
  }

  async findByTechnologyId(technologyId: string): Promise<Test[]> {
    const rows = await this.prisma.test.findMany({ where: { technologyId }, orderBy: { createdAt: 'desc' } });
    return rows.map((row) => this.toDomain(row));
  }

  async save(test: Test): Promise<Test> {
    const row = await this.prisma.test.upsert({
      where: { id: test.id },
      create: {
        id: test.id,
        title: test.title,
        technologyId: test.technologyId,
        status: test.status,
        durationMinutes: test.durationMinutes ?? null,
        passingScore: test.passingScore ?? null,
        createdByUserId: test.createdByUserId ?? 'admin',
      },
      update: {
        title: test.title,
        technologyId: test.technologyId,
        status: test.status,
        durationMinutes: test.durationMinutes ?? null,
        passingScore: test.passingScore ?? null,
      },
    });
    return this.toDomain(row);
  }

  private toDomain(raw: unknown): Test {
    const data = raw as Record<string, unknown>;
    return {
      id: data.id as string,
      title: data.title as string,
      technologyId: data.technologyId as string,
      status: data.status as string,
      durationMinutes: (data.durationMinutes as number | null) ?? null,
      passingScore: (data.passingScore as number | null) ?? null,
      createdByUserId: (data.createdByUserId as string | null) ?? null,
      createdAt: data.createdAt as Date,
      updatedAt: data.updatedAt as Date,
    };
  }
}
