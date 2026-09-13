import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findUnique({
    where: { id: 'b77e51db-1782-4679-bd91-4ad5a6e6beca' },
  });
  if (!user) {
    console.log('User not found');
    return;
  }
  console.log({
    id: user.id,
    email: user.email,
    username: user.username,
    role: user.role,
    activationStatus: user.activationStatus,
    credits: user.credits,
    companyProfileId: user.companyProfileId,
    hasPasswordHash: !!user.passwordHash,
    hasLegacyMd5Hash: !!user.legacyMd5Hash,
  });
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
