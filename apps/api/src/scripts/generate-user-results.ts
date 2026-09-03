import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
const USER_ID = 'b77e51db-1782-4679-bd91-4ad5a6e6beca';

async function main() {
  const technologies = await prisma.technology.findMany();
  let created = 0;
  for (const tech of technologies) {
    if (created >= 5) break;
    const questions = await prisma.question.findMany({ where: { technologyId: tech.id }, take: 10, orderBy: { orderIndex: 'asc' } });
    if (questions.length === 0) continue;
    const answersByQuestion: Record<string, { id: string; isCorrect: boolean }[]> = {};
    for (const q of questions) {
      const answers = await prisma.answer.findMany({ where: { questionId: q.id } });
      answersByQuestion[q.id] = answers.map((a) => ({ id: a.id, isCorrect: a.isCorrect }));
    }
    const questionIds = questions.map((q) => q.id);
    const startedAt = new Date(Date.now() - (created + 1) * 24 * 60 * 60 * 1000);
    const completedAt = new Date(startedAt.getTime() + 15 * 60 * 1000);
    let score = 0;
    const session = await prisma.quizSession.create({
      data: {
        userId: USER_ID,
        technologyId: tech.id,
        status: 'completed',
        startedAt,
        completedAt,
        score: 0,
        currentQuestionIndex: questions.length,
        questionIdsSnapshot: JSON.stringify(questionIds),
      },
    });
    const userAnswerRows: { testSessionId: string; questionId: string; answerId: string; isCorrect: boolean; answeredAt: Date }[] = [];
    for (const q of questions) {
      const answers = answersByQuestion[q.id];
      const correct = answers.filter((a) => a.isCorrect);
      const incorrect = answers.filter((a) => !a.isCorrect);
      const pickCorrect = Math.random() < 0.6;
      const chosen = pickCorrect && correct.length > 0 ? correct[Math.floor(Math.random() * correct.length)] : incorrect[Math.floor(Math.random() * incorrect.length)];
      const isCorrect = chosen.isCorrect;
      if (isCorrect) score += q.score;
      userAnswerRows.push({ testSessionId: session.id, questionId: q.id, answerId: chosen.id, isCorrect, answeredAt: new Date(startedAt.getTime() + Math.floor(Math.random() * 15 * 60 * 1000)) });
    }
    await prisma.userAnswer.createMany({ data: userAnswerRows });
    const maxScore = questions.reduce((sum, q) => sum + q.score, 0);
    await prisma.quizSession.update({ where: { id: session.id }, data: { score } });
    await prisma.userResult.create({
      data: {
        resultCode: `USR-${Date.now()}-${created}`,
        userId: USER_ID,
        technologyId: tech.id,
        score,
        maxScore,
        status: 'completed',
        sessionId: session.id,
        createdAt: completedAt,
        updatedAt: completedAt,
      },
    });
    console.log(`Created result for ${tech.name}: ${score}/${maxScore}`);
    created++;
  }
}
main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
