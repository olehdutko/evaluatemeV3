import { CandidateResult, UserResult } from '../entities/result.entity';

export const IUserResultRepository = Symbol('IUserResultRepository');
export const ICandidateResultRepository = Symbol('ICandidateResultRepository');

export interface IUserResultRepository {
  findByResultCode(resultCode: string): Promise<UserResult | null>;
  findByUserId(userId: string): Promise<UserResult[]>;
  save(result: UserResult): Promise<UserResult>;
}

export interface ICandidateResultRepository {
  findByResultCode(resultCode: string): Promise<CandidateResult | null>;
  findByCandidateId(candidateId: string): Promise<CandidateResult[]>;
  save(result: CandidateResult): Promise<CandidateResult>;
}
