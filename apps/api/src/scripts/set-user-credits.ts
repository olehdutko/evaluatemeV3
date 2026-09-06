import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

async function main(): Promise<void> {
  const email = process.argv[2];
  const credits = Number(process.argv[3]);

  if (!email || Number.isNaN(credits) || credits < 0) {
    // eslint-disable-next-line no-console
    console.error('Usage: ts-node set-user-credits.ts <email> <credits>');
    process.exit(1);
  }

  const prisma = new PrismaClient();
  try {
    const user = await prisma.user.update({
      where: { email },
      data: { credits },
    });
    // eslint-disable-next-line no-console
    console.log(`Updated ${user.email}: credits = ${user.credits}`);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Failed to update credits:', err instanceof Error ? err.message : err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

void main();
