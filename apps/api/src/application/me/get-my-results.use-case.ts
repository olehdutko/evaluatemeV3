import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';

export interface MyResultListItem {
  resultCode: string;
  technologyId: string;
  technologyName: string;
  score: number | null;
  maxScore: number | null;
  status: string;
  createdAt: string;
}

@Injectable()
export class GetMyResultsUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(userId: string): Promise<{ success: true; data: MyResultListItem[] }> {
    const rows = await this.prisma.userResult.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    const technologyIds = [...new Set(rows.map((row) => row.technologyId as string))];
    const technologies = technologyIds.length > 0
      ? await this.prisma.technology.findMany({ where: { id: { in: technologyIds } }, select: { id: true, name: true } })
      : [];
    const techById = new Map(technologies.map((t) => [t.id, t.name]));

    const data: MyResultListItem[] = rows.map((row: Record<string, unknown>) => ({
      resultCode: row.resultCode as string,
      technologyId: row.technologyId as string,
      technologyName: techById.get(row.technologyId as string) || 'Unknown',
      score: row.score as number | null,
      maxScore: row.maxScore as number | null,
      status: row.status as string,
      createdAt: (row.createdAt as Date).toISOString(),
    }));

    return { success: true, data };
  }
}
