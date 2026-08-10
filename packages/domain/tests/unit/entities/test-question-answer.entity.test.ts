import {
  Answer,
  FreeSampleQuestion,
  Question,
  Test,
  validateSingleChoice,
} from '../../../src/entities/test.entity';
import { TestStatus } from '../../../src/entities/status.enums';

const now = new Date();

describe('Test / Question / Answer entities', () => {
  it('constructs a test', () => {
    const test: Test = {
      id: 'test-1',
      title: 'TypeScript Basics',
      technologyId: 'tech-1',
      status: TestStatus.PUBLISHED,
      durationMinutes: 30,
      passingScore: 70,
      createdByUserId: 'user-1',
      createdAt: now,
      updatedAt: now,
    };

    expect(test.status).toBe('published');
  });

  it('constructs a question', () => {
    const question: Question = {
      id: 'q-1',
      testId: 'test-1',
      content: 'What is a type?',
      type: 'single',
      orderIndex: 1,
      score: 1,
      createdAt: now,
      updatedAt: now,
    };

    expect(question.type).toBe('single');
  });

  it('validates single choice has exactly one correct answer', () => {
    const answers: Answer[] = [
      {
        id: 'a-1',
        questionId: 'q-1',
        content: 'Yes',
        isCorrect: true,
        orderIndex: 1,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'a-2',
        questionId: 'q-1',
        content: 'No',
        isCorrect: false,
        orderIndex: 2,
        createdAt: now,
        updatedAt: now,
      },
    ];

    expect(validateSingleChoice(answers)).toBe(true);
  });

  it('constructs a free sample question', () => {
    const sample: FreeSampleQuestion = {
      id: 'sample-1',
      technologyId: 'tech-1',
      content: 'Sample',
      type: 'text',
      explanation: 'Because',
      createdAt: now,
      updatedAt: now,
    };

    expect(sample.type).toBe('text');
  });
});
