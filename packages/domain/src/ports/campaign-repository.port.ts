import { Campaign, CampaignHistory } from '../entities/campaign.entity';

export interface ICampaignRepository {
  findById(id: string): Promise<Campaign | null>;
  findAll(): Promise<Campaign[]>;
  save(campaign: Campaign): Promise<Campaign>;
  saveHistory(history: CampaignHistory): Promise<CampaignHistory>;
}
