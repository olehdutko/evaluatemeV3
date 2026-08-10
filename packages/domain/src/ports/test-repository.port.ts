import { Answer, FreeSampleQuestion, Question, Test } from '../entities/test.entity';

export const ITestRepository = Symbol('ITestRepository');
export const IQuestionRepository = Symbol('IQuestionRepository');
export const IAnswerRepository = Symbol('IAnswerRepository');
export const IFreeSampleQuestionRepository = Symbol('IFreeSampleQuestionRepository');

export interface ITestRepository {
  findById(id: string): Promise<Test | null>;
  findAll(): Promise<Test[]>;
  findByTechnologyId(technologyId: string): Promise<Test[]>;
  save(test: Test): Promise<Test>;
}

export interface IQuestionRepository {
  findById(id: string): Promise<Question | null>;
  findByTestId(testId: string): Promise<Question[]>;
  save(question: Question): Promise<Question>;
}

export interface IAnswerRepository {
  findById(id: string): Promise<Answer | null>;
  findByQuestionId(questionId: string): Promise<Answer[]>;
  save(answer: Answer): Promise<Answer>;
}

export interface IFreeSampleQuestionRepository {
  findByTechnologyId(technologyId: string): Promise<FreeSampleQuestion[]>;
}
