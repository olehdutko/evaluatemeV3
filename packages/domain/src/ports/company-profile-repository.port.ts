import { CompanyProfile } from '../entities/company-profile.entity';

export const ICompanyProfileRepository = Symbol('ICompanyProfileRepository');

export interface ICompanyProfileRepository {
  findById(id: string): Promise<CompanyProfile | null>;
  findByUserId(userId: string): Promise<CompanyProfile | null>;
  save(profile: CompanyProfile): Promise<CompanyProfile>;
}
