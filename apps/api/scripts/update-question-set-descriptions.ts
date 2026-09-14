import { PrismaClient } from '@prisma/client';

const OLD_DATABASE_URL = process.env.OLD_DATABASE_URL;
const NEW_DATABASE_URL = process.env.NEW_DATABASE_URL ?? process.env.DATABASE_URL;

if (!OLD_DATABASE_URL) {
  console.error('OLD_DATABASE_URL environment variable is required');
  process.exit(1);
}

if (!NEW_DATABASE_URL) {
  console.error('NEW_DATABASE_URL or DATABASE_URL environment variable is required');
  process.exit(1);
}

interface LegacyTest {
  id: number;
  Name: string;
  Technology_id: number;
  description: string | null;
}

async function run(): Promise<void> {
  const oldPrisma = new PrismaClient({ datasources: { db: { url: OLD_DATABASE_URL } } });
  const newPrisma = new PrismaClient({ datasources: { db: { url: NEW_DATABASE_URL } } });

  try {
    const legacyTests: LegacyTest[] = await oldPrisma.$queryRaw`
      SELECT id, Name, Technology_id, description FROM Tests ORDER BY id ASC
    `;

    const legacyTechnologies = await oldPrisma.$queryRaw<{ Technology_id: number; Technology: string }[]>`
      SELECT Technology_id, Technology FROM Technologies ORDER BY Technology_id ASC
    `;

    const newTechnologies = await newPrisma.technology.findMany({
      select: { id: true, name: true },
    });

    const technologyNameToId = new Map(newTechnologies.map((t) => [t.name, t.id]));
    const legacyTechNameById = new Map(legacyTechnologies.map((t) => [t.Technology_id, t.Technology]));

    let updated = 0;
    let skipped = 0;

    for (const legacy of legacyTests) {
      const legacyTechName = legacyTechNameById.get(legacy.Technology_id);
      if (!legacyTechName) {
        skipped += 1;
        continue;
      }

      const newTechnologyId = technologyNameToId.get(legacyTechName);
      if (!newTechnologyId) {
        skipped += 1;
        continue;
      }

      const existing = await newPrisma.questionSet.findFirst({
        where: { technologyId: newTechnologyId, title: legacy.Name },
      });

      if (!existing) {
        skipped += 1;
        continue;
      }

      await newPrisma.questionSet.update({
        where: { id: existing.id },
        data: { description: legacy.description || null },
      });

      updated += 1;
    }

    console.log(`Updated ${updated} question set descriptions, skipped ${skipped}.`);
  } finally {
    await oldPrisma.$disconnect();
    await newPrisma.$disconnect();
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
