import { CandidateResult, UserResult } from '../entities/result.entity';

export interface IUserResultRepository {
  findByResultCode(resultCode: string): Promise<UserResult | null>;
  save(result: UserResult): Promise<UserResult>;
}

export interface ICandidateResultRepository {
  findByResultCode(resultCode: string): Promise<CandidateResult | null>;
  save(result: CandidateResult): Promise<CandidateResult>;
}
