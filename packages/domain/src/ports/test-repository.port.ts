import { FreeSampleQuestion } from '../entities/test.entity';

export const IFreeSampleQuestionRepository = Symbol('IFreeSampleQuestionRepository');

export interface IFreeSampleQuestionRepository {
  findByTechnologyId(technologyId: string): Promise<FreeSampleQuestion[]>;
}
