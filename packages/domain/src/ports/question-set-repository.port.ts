import { QuestionSet } from '../entities/technology.entity';

export const IQuestionSetRepository = Symbol('IQuestionSetRepository');

export interface IQuestionSetRepository {
  findById(id: string): Promise<QuestionSet | null>;
  findByTechnologyId(technologyId: string): Promise<QuestionSet[]>;
  findByTechnologyIdAndTitle(technologyId: string, title: string): Promise<QuestionSet | null>;
  save(questionSet: QuestionSet): Promise<QuestionSet>;
  delete(id: string): Promise<void>;
}
