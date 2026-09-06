import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';

async function main(): Promise<void> {
  const [email, password, companyName] = process.argv.slice(2);

  if (!email || !password || !companyName) {
    // eslint-disable-next-line no-console
    console.error('Usage: ts-node create-company-user.ts <email> <password> "Company Name"');
    process.exit(1);
  }

  const prisma = new PrismaClient();
  try {
    const passwordHash = await bcrypt.hash(password, 10);
    const userId = crypto.randomUUID();
    const profileId = crypto.randomUUID();

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      // eslint-disable-next-line no-console
      console.error(`User with email ${email} already exists.`);
      process.exit(1);
    }

    await prisma.$transaction([
      prisma.user.create({
        data: {
          id: userId,
          email,
          username: null,
          passwordHash,
          legacyMd5Hash: null,
          role: 'company',
          activationStatus: 'active',
          companyProfileId: profileId,
          credits: 0,
          firstName: companyName,
          lastName: null,
          middleName: null,
          birthDate: null,
          country: null,
          city: null,
          phone: null,
        },
      }),
      prisma.companyProfile.create({
        data: {
          id: profileId,
          userId,
          companyName,
          address: null,
          phone: null,
          country: null,
          occupation: null,
          availableTests: 100,
          availableAccessCodes: 1000,
        },
      }),
    ]);

    // eslint-disable-next-line no-console
    console.log(`Company user created: ${email}`);
    // eslint-disable-next-line no-console
    console.log(`  password: ${password}`);
    // eslint-disable-next-line no-console
    console.log(`  companyName: ${companyName}`);
    // eslint-disable-next-line no-console
    console.log(`  availableTests: 100`);
    // eslint-disable-next-line no-console
    console.log(`  availableAccessCodes: 1000`);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Failed to create company user:', err instanceof Error ? err.message : err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

void main();
