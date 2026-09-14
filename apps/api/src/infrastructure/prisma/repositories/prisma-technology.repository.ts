import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { ITechnologyRepository, Technology } from '@evaluateme/domain';

@Injectable()
export class PrismaTechnologyRepository implements ITechnologyRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<Technology[]> {
    const rows = await this.prisma.technology.findMany({ orderBy: { name: 'asc' } });
    return rows.map((row) => this.toDomain(row));
  }

  async findById(id: string): Promise<Technology | null> {
    const row = await this.prisma.technology.findUnique({ where: { id } });
    return row ? this.toDomain(row) : null;
  }

  async findBySlug(slug: string): Promise<Technology | null> {
    const row = await this.prisma.technology.findUnique({ where: { slug } });
    return row ? this.toDomain(row) : null;
  }

  async findByName(name: string): Promise<Technology | null> {
    const row = await this.prisma.technology.findUnique({ where: { name } });
    return row ? this.toDomain(row) : null;
  }

  async save(technology: Technology): Promise<Technology> {
    const row = await this.prisma.technology.upsert({
      where: { id: technology.id },
      create: {
        id: technology.id,
        name: technology.name,
        slug: technology.slug,
        description: technology.description,
      },
      update: {
        name: technology.name,
        slug: technology.slug,
        description: technology.description,
      },
    });
    return this.toDomain(row);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.technology.delete({ where: { id } });
  }

  private toDomain(raw: unknown): Technology {
    const data = raw as Record<string, unknown>;
    return {
      id: data.id as string,
      name: data.name as string,
      slug: data.slug as string,
      description: data.description as string | null,
      createdAt: data.createdAt as Date,
      updatedAt: data.updatedAt as Date,
    };
  }
}
