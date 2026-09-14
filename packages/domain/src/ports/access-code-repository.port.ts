import { AccessCode } from '../entities/access-code.entity';

export const IAccessCodeRepository = Symbol('IAccessCodeRepository');

export interface IAccessCodeRepository {
  findById(id: string): Promise<AccessCode | null>;
  findByCode(code: string): Promise<AccessCode | null>;
  findByCampaignId(campaignId: string): Promise<AccessCode[]>;
  save(accessCode: AccessCode): Promise<AccessCode>;
  countByCompanyId(companyId: string): Promise<number>;
  countByCampaignId(campaignId: string): Promise<number>;
  countSentByCompanyId(companyId: string): Promise<number>;
  updateStatusByCampaignId(campaignId: string, fromStatus: string, toStatus: string): Promise<number>;
  delete(id: string): Promise<void>;
}
