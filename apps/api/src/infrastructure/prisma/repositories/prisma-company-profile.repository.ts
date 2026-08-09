import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { ICompanyProfileRepository, CompanyProfile } from '@evaluateme/domain';

@Injectable()
export class PrismaCompanyProfileRepository implements ICompanyProfileRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<CompanyProfile | null> {
    const profile = await this.prisma.companyProfile.findUnique({ where: { id } });
    return profile ? this.toDomain(profile) : null;
  }

  async findByUserId(userId: string): Promise<CompanyProfile | null> {
    const profile = await this.prisma.companyProfile.findUnique({ where: { userId } });
    return profile ? this.toDomain(profile) : null;
  }

  async save(profile: CompanyProfile): Promise<CompanyProfile> {
    const saved = await this.prisma.companyProfile.upsert({
      where: { id: profile.id },
      create: {
        id: profile.id,
        userId: profile.userId,
        companyName: profile.companyName,
        address: profile.address,
        phone: profile.phone,
        country: profile.country,
        occupation: profile.occupation,
        availableTests: profile.availableTests,
        availableAccessCodes: profile.availableAccessCodes,
      },
      update: {
        companyName: profile.companyName,
        address: profile.address,
        phone: profile.phone,
        country: profile.country,
        occupation: profile.occupation,
        availableTests: profile.availableTests,
        availableAccessCodes: profile.availableAccessCodes,
      },
    });
    return this.toDomain(saved);
  }

  private toDomain(raw: unknown): CompanyProfile {
    const data = raw as Record<string, unknown>;
    return {
      id: data.id as string,
      userId: data.userId as string,
      companyName: data.companyName as string,
      address: data.address as string | null,
      phone: data.phone as string | null,
      country: data.country as string | null,
      occupation: data.occupation as string | null,
      availableTests: data.availableTests as number,
      availableAccessCodes: data.availableAccessCodes as number,
      createdAt: data.createdAt as Date,
      updatedAt: data.updatedAt as Date,
    };
  }
}
