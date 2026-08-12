import { PrismaClient } from '@prisma/client';
import * as crypto from 'crypto';

const SOURCE_DATABASE_URL = process.env.SOURCE_DATABASE_URL ?? 'mysql://evaluateme-agent:Ch9%23kL2%24vM5%26pQ8*xW4!tN6%40jR7%23eD3%24@192.168.1.132:3306/evaluateme_db';
const TARGET_DATABASE_URL = process.env.TARGET_DATABASE_URL ?? 'mysql://evaluateme-agent:Ch9%23kL2%24vM5%26pQ8*xW4!tN6%40jR7%23eD3%24@192.168.1.132:3306/evaluateme_v3';

interface LegacyTechnology {
  Technology_id: number;
  Technology: string;
  is_active: number;
}

interface LegacyQuestion {
  ID: number;
  text: string;
  Test_id: number;
  BookChapter: string;
  Justification: string | null;
}

interface LegacyAnswer {
  QuestionID: number;
  AnswerID: number;
  Answer: string;
  Correct: number;
}

const usedSlugs = new Set<string>();

function slugify(name: string): string {
  let slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

  // Handle cases where slugification strips everything (e.g., "C#" -> "c", "C++" -> "c").
  if (!slug) {
    slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  }
  if (!slug) {
    slug = 'technology';
  }

  let uniqueSlug = slug;
  let suffix = 2;
  while (usedSlugs.has(uniqueSlug)) {
    uniqueSlug = `${slug}-${suffix}`;
    suffix++;
  }
  usedSlugs.add(uniqueSlug);
  return uniqueSlug;
}

async function migrate(): Promise<void> {
  const source = new PrismaClient({ datasources: { db: { url: SOURCE_DATABASE_URL } } });
  const target = new PrismaClient({ datasources: { db: { url: TARGET_DATABASE_URL } } });

  try {
    // 1. Load legacy technologies
    const legacyTechnologies = await source.$queryRaw<LegacyTechnology[]>`
      SELECT Technology_id, Technology, is_active FROM Technologies ORDER BY Technology_id
    `;

    // 2. Insert technologies into target, keeping a map from legacy ID -> new UUID
    const technologyIdMap = new Map<number, string>();
    for (const tech of legacyTechnologies) {
      const id = crypto.randomUUID();
      const slug = slugify(tech.Technology);
      await target.technology.upsert({
        where: { name: tech.Technology },
        create: {
          id,
          name: tech.Technology,
          slug,
          description: `Imported legacy technology (was ID ${tech.Technology_id}, active=${tech.is_active}).`,
        },
        update: {
          slug,
          description: `Imported legacy technology (was ID ${tech.Technology_id}, active=${tech.is_active}).`,
        },
      });
      const created = await target.technology.findUnique({ where: { name: tech.Technology } });
      if (created) {
        technologyIdMap.set(tech.Technology_id, created.id);
      }
    }

    console.log(`Migrated ${technologyIdMap.size} technologies.`);

    // 3. Process questions in batches
    const batchSize = 500;
    let offset = 0;
    let totalQuestions = 0;
    let totalAnswers = 0;

    while (true) {
      const questions = await source.$queryRaw<LegacyQuestion[]>`
        SELECT ID, text, Test_id, BookChapter, Justification
        FROM Questions
        ORDER BY ID
        LIMIT ${batchSize} OFFSET ${offset}
      `;

      if (questions.length === 0) {
        break;
      }

      const questionIds = questions.map((q) => q.ID);
      const idList = questionIds.join(',');
      const answers = await source.$queryRawUnsafe<LegacyAnswer[]>(`
        SELECT QuestionID, AnswerID, Answer, Correct
        FROM Answer
        WHERE QuestionID IN (${idList})
        ORDER BY AnswerID
      `);

      const answersByQuestion = new Map<number, LegacyAnswer[]>();
      for (const answer of answers) {
        const list = answersByQuestion.get(answer.QuestionID) ?? [];
        list.push(answer);
        answersByQuestion.set(answer.QuestionID, list);
      }

      for (const question of questions) {
        const technologyId = technologyIdMap.get(question.Test_id);
        if (!technologyId) {
          console.warn(`Skipping question ${question.ID}: unknown Test_id ${question.Test_id}`);
          continue;
        }

        const questionId = crypto.randomUUID();
        const questionAnswers = answersByQuestion.get(question.ID) ?? [];

        // Normalize question text: trim whitespace and remove leading <br> tags
        const content = question.text
          .replace(/^\s*<br>\s*/i, '')
          .replace(/^\r\n|\r|\n/, '')
          .trim();

        if (!content) {
          console.warn(`Skipping question ${question.ID}: empty content`);
          continue;
        }

        // Determine question type based on number of correct answers
        const correctCount = questionAnswers.filter((a) => a.Correct === 1).length;
        const type = correctCount > 1 ? 'multiple_choice' : 'single_choice';

        // Compute order index within technology based on legacy ID to keep stable order
        const orderIndex = question.ID;

        await target.question.create({
          data: {
            id: questionId,
            technologyId,
            content,
            type,
            orderIndex,
            score: 1,
          },
        });

        if (questionAnswers.length > 0) {
          await target.answer.createMany({
            data: questionAnswers.map((answer, index) => ({
              id: crypto.randomUUID(),
              questionId,
              content: answer.Answer.trim(),
              isCorrect: answer.Correct === 1,
              orderIndex: index + 1,
            })),
            skipDuplicates: false,
          });
        }

        totalQuestions++;
        totalAnswers += questionAnswers.length;
      }

      offset += batchSize;
      console.log(`Processed ${offset} legacy questions...`);
    }

    console.log(`Migration complete: ${totalQuestions} questions, ${totalAnswers} answers.`);
  } finally {
    await source.$disconnect();
    await target.$disconnect();
  }
}

migrate().catch((error) => {
  console.error(error);
  process.exit(1);
});
