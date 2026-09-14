import { PrismaClient } from '@prisma/client';
import { randomUUID } from 'crypto';

const OLD_DATABASE_URL = process.env.OLD_DATABASE_URL;
const NEW_DATABASE_URL = process.env.NEW_DATABASE_URL ?? process.env.DATABASE_URL;
const BATCH_SIZE = Number(process.env.BATCH_SIZE ?? 500);

if (!OLD_DATABASE_URL) {
  console.error('OLD_DATABASE_URL environment variable is required');
  process.exit(1);
}

if (!NEW_DATABASE_URL) {
  console.error('NEW_DATABASE_URL or DATABASE_URL environment variable is required');
  process.exit(1);
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

function stripHtml(value: string): string {
  return value
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/\r\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function determineQuestionType(answers: LegacyAnswer[]): 'single' | 'multiple' {
  const correctCount = answers.filter((a) => a.Correct === 1).length;
  return correctCount > 1 ? 'multiple' : 'single';
}

function chunk<T>(items: T[], size: number): T[][] {
  const result: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    result.push(items.slice(i, i + size));
  }
  return result;
}

async function run(): Promise<void> {
  const oldPrisma = new PrismaClient({ datasources: { db: { url: OLD_DATABASE_URL } } });
  const newPrisma = new PrismaClient({ datasources: { db: { url: NEW_DATABASE_URL } } });

  try {
    console.log('Loading legacy questions and answers...');
    const legacyQuestions: LegacyQuestion[] = await oldPrisma.$queryRaw`
      SELECT ID, text, Test_id, BookChapter, Justification
      FROM Questions
      ORDER BY ID ASC
    `;

    const legacyAnswers: LegacyAnswer[] = await oldPrisma.$queryRaw`
      SELECT QuestionID, AnswerID, Answer, Correct
      FROM Answer
      ORDER BY AnswerID ASC
    `;

    console.log(`Loaded ${legacyQuestions.length} questions and ${legacyAnswers.length} answers.`);

    const answersByQuestionId = new Map<number, LegacyAnswer[]>();
    for (const answer of legacyAnswers) {
      const list = answersByQuestionId.get(answer.QuestionID) ?? [];
      list.push(answer);
      answersByQuestionId.set(answer.QuestionID, list);
    }

    const questionSets = await newPrisma.questionSet.findMany({
      select: { id: true, title: true },
    });

    const legacyTests: Array<{ id: number; Name: string }> = await oldPrisma.$queryRaw`
      SELECT id, Name FROM Tests ORDER BY id ASC
    `;

    const legacyTestNameById = new Map(legacyTests.map((t) => [t.id, t.Name]));
    const newQuestionSetByTitle = new Map(questionSets.map((qs) => [qs.title, qs.id]));

    const questionIdMap = new Map<number, string>();
    const questionRows: Array<{
      id: string;
      questionSetId: string;
      content: string;
      type: string;
      orderIndex: number;
      score: number;
      createdAt: Date;
      updatedAt: Date;
    }> = [];
    let createdQuestions = 0;
    let skippedQuestions = 0;

    for (const legacy of legacyQuestions) {
      const testName = legacyTestNameById.get(legacy.Test_id);
      if (!testName) {
        console.warn(`Skipping question ${legacy.ID}: unknown test ${legacy.Test_id}`);
        skippedQuestions += 1;
        continue;
      }

      const questionSetId = newQuestionSetByTitle.get(testName);
      if (!questionSetId) {
        console.warn(`Skipping question ${legacy.ID}: question set "${testName}" not found`);
        skippedQuestions += 1;
        continue;
      }

      const legacyQuestionAnswers = answersByQuestionId.get(legacy.ID) ?? [];
      if (legacyQuestionAnswers.length === 0) {
        console.warn(`Skipping question ${legacy.ID}: no answers`);
        skippedQuestions += 1;
        continue;
      }

      const questionId = randomUUID();
      questionIdMap.set(legacy.ID, questionId);

      const content = stripHtml(legacy.text);
      const type = determineQuestionType(legacyQuestionAnswers);

      questionRows.push({
        id: questionId,
        questionSetId,
        content,
        type: type === 'multiple' ? 'multiple_choice' : 'single_choice',
        orderIndex: legacy.ID,
        score: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      createdQuestions += 1;
    }

    console.log(`Inserting ${questionRows.length} questions in batches of ${BATCH_SIZE}...`);
    const questionBatches = chunk(questionRows, BATCH_SIZE);
    for (let i = 0; i < questionBatches.length; i += 1) {
      await newPrisma.question.createMany({ data: questionBatches[i] });
      console.log(`  Question batch ${i + 1}/${questionBatches.length} done.`);
    }

    const answerRows: Array<{
      id: string;
      questionId: string;
      content: string;
      isCorrect: boolean;
      orderIndex: number;
      createdAt: Date;
    }> = [];
    let createdAnswers = 0;

    for (const legacy of legacyAnswers) {
      const questionId = questionIdMap.get(legacy.QuestionID);
      if (!questionId) {
        continue;
      }

      answerRows.push({
        id: randomUUID(),
        questionId,
        content: stripHtml(legacy.Answer),
        isCorrect: legacy.Correct === 1,
        orderIndex: legacy.AnswerID,
        createdAt: new Date(),
      });

      createdAnswers += 1;
    }

    console.log(`Inserting ${answerRows.length} answers in batches of ${BATCH_SIZE}...`);
    const answerBatches = chunk(answerRows, BATCH_SIZE);
    for (let i = 0; i < answerBatches.length; i += 1) {
      await newPrisma.answer.createMany({ data: answerBatches[i] });
      console.log(`  Answer batch ${i + 1}/${answerBatches.length} done.`);
    }

    console.log(
      `Migration complete. Created ${createdQuestions} questions, ${createdAnswers} answers. Skipped ${skippedQuestions} questions.`,
    );
  } finally {
    await oldPrisma.$disconnect();
    await newPrisma.$disconnect();
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
