import { Entity } from './base.entity';
import { CampaignStatus } from './status.enums';

export interface Campaign extends Entity {
  name: string;
  description: string | null;
  status: CampaignStatus;
  createdByUserId: string;
  startDate: Date | null;
  endDate: Date | null;
}

export interface CampaignHistory extends Entity {
  campaignId: string;
  status: CampaignStatus;
  changedByUserId: string;
  changedAt: Date;
}
