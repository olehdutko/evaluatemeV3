import { Entity } from './base.entity';
import { CampaignStatus } from './status.enums';

export interface Campaign extends Entity {
  companyId: string | null;
  name: string;
  description: string | null;
  notes: string | null;
  status: CampaignStatus;
  createdByUserId: string;
  startDate: Date | null;
  endDate: Date | null;
}

export interface CampaignHistory extends Entity {
  campaignId: string;
  action: string;
  status: CampaignStatus | null;
  changedByUserId: string;
  metadata: string | null;
  changedAt: Date;
}
