import { PrismaClient } from '@prisma/client';
import { randomUUID } from 'crypto';

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
  questions_count: number;
  minutes: number;
  is_free: number;
  description: string;
}

interface LegacyTechnology {
  Technology_id: number;
  Technology: string;
  is_active: number;
}

async function run(): Promise<void> {
  const oldPrisma = new PrismaClient({ datasources: { db: { url: OLD_DATABASE_URL } } });
  const newPrisma = new PrismaClient({ datasources: { db: { url: NEW_DATABASE_URL } } });

  try {
    const legacyTests: LegacyTest[] = await oldPrisma.$queryRaw`
      SELECT id, Name, Technology_id, questions_count, minutes, is_free, description
      FROM Tests
      ORDER BY id ASC
    `;

    const legacyTechnologies: LegacyTechnology[] = await oldPrisma.$queryRaw`
      SELECT Technology_id, Technology, is_active
      FROM Technologies
      ORDER BY Technology_id ASC
    `;

    const newTechnologies = await newPrisma.technology.findMany({
      select: { id: true, name: true },
    });

    const technologyNameToId = new Map(newTechnologies.map((t) => [t.name, t.id]));
    const legacyTechNameById = new Map(legacyTechnologies.map((t) => [t.Technology_id, t.Technology]));

    let created = 0;
    let skipped = 0;

    for (const legacy of legacyTests) {
      const legacyTechName = legacyTechNameById.get(legacy.Technology_id);
      if (!legacyTechName) {
        console.warn(`Skipping test ${legacy.id}: unknown legacy technology ${legacy.Technology_id}`);
        skipped += 1;
        continue;
      }

      const newTechnologyId = technologyNameToId.get(legacyTechName);
      if (!newTechnologyId) {
        console.warn(`Skipping test ${legacy.id}: technology "${legacyTechName}" not found in new DB`);
        skipped += 1;
        continue;
      }

      const existing = await newPrisma.questionSet.findFirst({
        where: { technologyId: newTechnologyId, title: legacy.Name },
      });

      if (existing) {
        console.warn(`Skipping test ${legacy.id}: question set "${legacy.Name}" for "${legacyTechName}" already exists`);
        skipped += 1;
        continue;
      }

      await newPrisma.questionSet.create({
        data: {
          id: randomUUID(),
          title: legacy.Name,
          technologyId: newTechnologyId,
          status: 'active',
          quizQuestionCount: legacy.questions_count,
          quizDurationMinutes: legacy.minutes,
          createdByUserId: '00000000-0000-0000-0000-000000000000',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });

      created += 1;
    }

    console.log(`Migration complete. Created ${created} question sets, skipped ${skipped}.`);
  } finally {
    await oldPrisma.$disconnect();
    await newPrisma.$disconnect();
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
