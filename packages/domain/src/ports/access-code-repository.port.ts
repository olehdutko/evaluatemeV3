import { AccessCode } from '../entities/access-code.entity';

export const IAccessCodeRepository = Symbol('IAccessCodeRepository');

export interface IAccessCodeRepository {
  findById(id: string): Promise<AccessCode | null>;
  findByCode(code: string): Promise<AccessCode | null>;
  findByCampaignId(campaignId: string): Promise<AccessCode[]>;
  save(accessCode: AccessCode): Promise<AccessCode>;
}
