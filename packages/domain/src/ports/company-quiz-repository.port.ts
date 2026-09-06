import { CompanyQuiz, CustomQuizQuestion, CompanyQuizQuestion, CompanyQuizAnswer } from '../entities/company-quiz.entity';

export const ICompanyQuizRepository = Symbol('ICompanyQuizRepository');

export interface ICompanyQuizRepository {
  findById(id: string): Promise<CompanyQuiz | null>;
  findByCompanyId(companyId: string): Promise<CompanyQuiz[]>;
  save(quiz: CompanyQuiz, questions: CustomQuizQuestion[] | CompanyQuizQuestion[], answers?: CompanyQuizAnswer[]): Promise<CompanyQuiz>;
}
