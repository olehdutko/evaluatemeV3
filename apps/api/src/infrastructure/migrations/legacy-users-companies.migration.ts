import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  IUserRepository,
  ICompanyProfileRepository,
  IPasswordHasher,
  User,
  CompanyProfile,
  UserRole,
  ActivationStatus,
} from '@evaluateme/domain';

interface LegacyUser {
  id: string;
  email: string;
  password: string | null;
  role: string;
  status: number;
}

interface LegacyCompany {
  id: string;
  email: string;
  company_name: string;
  address: string | null;
  phone: string | null;
  country: string | null;
  occupation: string | null;
  available_tests: number;
  available_access_codes: number;
  user_id: string | null;
}

@Injectable()
export class LegacyUsersCompaniesMigration {
  constructor(
    private readonly prisma: PrismaService,
    private readonly userRepository: IUserRepository,
    private readonly companyProfileRepository: ICompanyProfileRepository,
    private readonly passwordHasher: IPasswordHasher,
  ) {}

  async run(options: { dryRun: boolean }): Promise<{ usersCreated: number; profilesCreated: number }> {
    let usersCreated = 0;
    let profilesCreated = 0;

    const legacyUsers = await this.prisma.$queryRaw<LegacyUser[]>`
      SELECT id, email, password, role, status
      FROM users
      WHERE role IS NULL OR activation_status IS NULL
    `;

    for (const legacy of legacyUsers) {
      const existing = await this.userRepository.findByEmail(legacy.email);
      if (existing) continue;

      const v3Role = this.mapRole(legacy.role);
      const v3Status = legacy.status === 1 ? ActivationStatus.ACTIVE : ActivationStatus.PENDING;

      let passwordHash: string | null = null;
      let legacyMd5Hash: string | null = null;

      if (legacy.password) {
        if (this.passwordHasher.isLegacyHash(legacy.password)) {
          legacyMd5Hash = legacy.password;
        } else {
          passwordHash = await this.passwordHasher.hash(legacy.password);
        }
      }

      const user: User = {
        id: crypto.randomUUID(),
        email: legacy.email,
        username: null,
        passwordHash,
        legacyMd5Hash,
        role: v3Role,
        activationStatus: v3Status,
        companyProfileId: null,
        credits: 0,
        firstName: null,
        lastName: null,
        middleName: null,
        birthDate: null,
        country: null,
        city: null,
        phone: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      if (!options.dryRun) {
        await this.userRepository.save(user);
      }
      usersCreated++;
    }

    const legacyCompanies = await this.prisma.$queryRaw<LegacyCompany[]>`
      SELECT c.*, u.id as user_id
      FROM Companies c
      LEFT JOIN users u ON c.email = u.email
    `;

    for (const legacy of legacyCompanies) {
      if (!legacy.user_id) continue;

      const existingProfile = await this.companyProfileRepository.findByUserId(legacy.user_id);
      if (existingProfile) continue;

      const profile: CompanyProfile = {
        id: crypto.randomUUID(),
        userId: legacy.user_id,
        companyName: legacy.company_name,
        address: legacy.address,
        phone: legacy.phone,
        country: legacy.country,
        occupation: legacy.occupation,
        availableTests: legacy.available_tests ?? 0,
        availableAccessCodes: legacy.available_access_codes ?? 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      if (!options.dryRun) {
        await this.companyProfileRepository.save(profile);
      }
      profilesCreated++;
    }

    return { usersCreated, profilesCreated };
  }

  private mapRole(legacyRole: string): UserRole {
    switch (legacyRole?.toLowerCase()) {
      case 'admin':
        return UserRole.ADMIN;
      case 'company':
        return UserRole.COMPANY;
      default:
        return UserRole.USER;
    }
  }
}
