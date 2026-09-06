import { Campaign, CampaignHistory } from '../entities/campaign.entity';

export const ICampaignRepository = Symbol('ICampaignRepository');

export interface ICampaignRepository {
  findById(id: string): Promise<Campaign | null>;
  findByCompanyId(companyId: string): Promise<Campaign[]>;
  findByCompanyIdAndStatus(companyId: string, status: string): Promise<Campaign[]>;
  save(campaign: Campaign): Promise<Campaign>;
  saveHistory(history: CampaignHistory): Promise<CampaignHistory>;
  findHistoryByCampaignId(campaignId: string): Promise<CampaignHistory[]>;
}
