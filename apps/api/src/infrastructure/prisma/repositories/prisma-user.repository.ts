import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { IUserRepository, User, UserRole, ActivationStatus } from '@evaluateme/domain';

@Injectable()
export class PrismaUserRepository implements IUserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<User[]> {
    const rows = await this.prisma.user.findMany({ orderBy: { createdAt: 'desc' } });
    return rows.map((row) => this.toDomain(row));
  }

  async findById(id: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    return user ? this.toDomain(user) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    return user ? this.toDomain(user) : null;
  }

  async findByUsername(username: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({ where: { username } });
    return user ? this.toDomain(user) : null;
  }

  async save(user: User): Promise<User> {
    const saved = await this.prisma.user.upsert({
      where: { id: user.id },
      create: {
        id: user.id,
        email: user.email,
        username: user.username,
        passwordHash: user.passwordHash,
        legacyMd5Hash: user.legacyMd5Hash,
        role: user.role,
        activationStatus: user.activationStatus,
        companyProfileId: user.companyProfileId,
        credits: user.credits,
      },
      update: {
        email: user.email,
        username: user.username,
        passwordHash: user.passwordHash,
        legacyMd5Hash: user.legacyMd5Hash,
        role: user.role,
        activationStatus: user.activationStatus,
        companyProfileId: user.companyProfileId,
        credits: user.credits,
      },
    });
    return this.toDomain(saved);
  }

  private toDomain(raw: unknown): User {
    const data = raw as Record<string, unknown>;
    return {
      id: data.id as string,
      email: data.email as string,
      username: (data.username as string | null) ?? null,
      passwordHash: data.passwordHash as string | null,
      legacyMd5Hash: data.legacyMd5Hash as string | null,
      role: data.role as UserRole,
      activationStatus: data.activationStatus as ActivationStatus,
      companyProfileId: data.companyProfileId as string | null,
      credits: typeof data.credits === 'number' ? data.credits : Number(data.credits ?? 0),
      createdAt: data.createdAt as Date,
      updatedAt: data.updatedAt as Date,
    };
  }
}
