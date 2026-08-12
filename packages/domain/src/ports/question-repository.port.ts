import { Question, Answer } from '../entities/test.entity';

export const IQuestionRepository = Symbol('IQuestionRepository');
export const IAnswerRepository = Symbol('IAnswerRepository');

export interface IQuestionRepository {
  findById(id: string): Promise<Question | null>;
  findByTechnologyId(technologyId: string): Promise<Question[]>;
  findByTechnologyIdRandomized(technologyId: string, limit: number): Promise<Question[]>;
  save(question: Question): Promise<Question>;
  delete(id: string): Promise<void>;
}

export interface IAnswerRepository {
  findById(id: string): Promise<Answer | null>;
  findByQuestionId(questionId: string): Promise<Answer[]>;
  findByQuestionIds(questionIds: string[]): Promise<Answer[]>;
  save(answer: Answer): Promise<Answer>;
  delete(id: string): Promise<void>;
}
