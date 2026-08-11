import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { ILandingAdRepository, LandingAd, LandingAdPosition } from '@evaluateme/domain';

@Injectable()
export class PrismaLandingAdRepository implements ILandingAdRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<LandingAd[]> {
    const rows = await this.prisma.landingAd.findMany({ orderBy: { createdAt: 'desc' } });
    return rows.map((row) => this.toDomain(row));
  }

  async findActiveByPosition(position: LandingAdPosition): Promise<LandingAd[]> {
    const rows = await this.prisma.landingAd.findMany({
      where: { position, isActive: true },
      orderBy: { createdAt: 'desc' },
    });
    return rows.map((row) => this.toDomain(row));
  }

  async findById(id: string): Promise<LandingAd | null> {
    const row = await this.prisma.landingAd.findUnique({ where: { id } });
    return row ? this.toDomain(row) : null;
  }

  async save(ad: LandingAd): Promise<LandingAd> {
    const row = await this.prisma.landingAd.upsert({
      where: { id: ad.id },
      create: {
        id: ad.id,
        title: ad.title,
        content: ad.content,
        imageUrl: ad.imageUrl,
        linkUrl: ad.linkUrl,
        position: ad.position,
        isActive: ad.isActive,
      },
      update: {
        title: ad.title,
        content: ad.content,
        imageUrl: ad.imageUrl,
        linkUrl: ad.linkUrl,
        position: ad.position,
        isActive: ad.isActive,
      },
    });
    return this.toDomain(row);
  }

  private toDomain(raw: unknown): LandingAd {
    const data = raw as Record<string, unknown>;
    return {
      id: data.id as string,
      title: data.title as string,
      content: (data.content as string | null) ?? null,
      imageUrl: (data.imageUrl as string | null) ?? null,
      linkUrl: (data.linkUrl as string | null) ?? null,
      position: data.position as LandingAdPosition,
      isActive: data.isActive as boolean,
      createdAt: data.createdAt as Date,
      updatedAt: data.updatedAt as Date,
    };
  }
}
