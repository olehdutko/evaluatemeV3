import { appConfig } from '../infrastructure/config/app-config';
import { LegacyUsersCompaniesMigration } from '../infrastructure/migrations/legacy-users-companies.migration';
import { LegacySessionsResultsMigration } from '../infrastructure/migrations/legacy-sessions-results.migration';
import { PrismaUserRepository } from '../infrastructure/prisma/repositories/prisma-user.repository';
import { PrismaCompanyProfileRepository } from '../infrastructure/prisma/repositories/prisma-company-profile.repository';
import {
  PrismaUserSessionRepository,
  PrismaUserResultRepository,
  PrismaCandidateSessionRepository,
  PrismaCandidateResultRepository,
} from '../infrastructure/prisma/repositories/prisma-session-result.repository';
import { BcryptPasswordHasher } from '../infrastructure/security/bcrypt-password-hasher';
import { createLogger } from '../infrastructure/logging/logger';
import { MigrationGuard } from '../infrastructure/migrations/migration-guard';
import { PrismaService } from '../infrastructure/prisma/prisma.service';
import { Prisma } from '@prisma/client';

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const migrationNameIndex = args.findIndex((arg) => arg === '--migration-name');
  const migrationName = migrationNameIndex !== -1 ? args[migrationNameIndex + 1] : null;
  const forceDestructive = args.includes('--force-destructive');

  const logger = createLogger('migration-runner');

  if (!migrationName) {
    logger.error('Missing --migration-name argument');
    process.exit(1);
  }

  logger.info('Starting migration runner', { migrationName, dryRun, forceDestructive });

  const prisma = new PrismaService({
    datasources: { db: { url: appConfig.databaseUrl } },
  });
  await prisma.$connect();

  const guard = new MigrationGuard({ forceDestructive });

  const passwordHasher = new BcryptPasswordHasher();
  const userRepository = new PrismaUserRepository(prisma);
  const companyProfileRepository = new PrismaCompanyProfileRepository(prisma);

  try {
    if (migrationName === 'legacy-users-companies') {
      guard.checkOperation('migrate', 'users');
      const migration = new LegacyUsersCompaniesMigration(
        prisma,
        userRepository,
        companyProfileRepository,
        passwordHasher,
      );
      const result = await migration.run({ dryRun });
      logger.info('legacy-users-companies migration result', result);
    } else if (migrationName === 'legacy-sessions-results') {
      guard.checkOperation('migrate', 'user_sessions');
      const userSessionRepo = new PrismaUserSessionRepository(prisma);
      const candidateSessionRepo = new PrismaCandidateSessionRepository(prisma);
      const userResultRepo = new PrismaUserResultRepository(prisma);
      const candidateResultRepo = new PrismaCandidateResultRepository(prisma);
      const migration = new LegacySessionsResultsMigration(
        userSessionRepo,
        candidateSessionRepo,
        userResultRepo,
        candidateResultRepo,
        { query: (sql) => prisma.$queryRaw(Prisma.raw(sql)) },
      );
      const result = await migration.run({ dryRun });
      logger.info('legacy-sessions-results migration result', result);
    } else {
      logger.error('Unknown migration name', { migrationName });
      process.exit(1);
    }

    logger.info('Migration runner completed successfully');
  } catch (error: unknown) {
    logger.error('Migration runner failed', { error: error instanceof Error ? error.message : String(error) });
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

void main();
