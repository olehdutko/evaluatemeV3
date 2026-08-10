import { Campaign, CampaignHistory } from '../../../src/entities/campaign.entity';
import { CampaignStatus } from '../../../src/entities/status.enums';

describe('Campaign entities', () => {
  it('constructs a campaign', () => {
    const campaign: Campaign = {
      id: 'campaign-1',
      name: 'Summer Sale',
      description: 'Promo',
      status: CampaignStatus.ACTIVE,
      createdByUserId: 'user-1',
      startDate: new Date(),
      endDate: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    expect(campaign.status).toBe('active');
  });

  it('constructs campaign history', () => {
    const history: CampaignHistory = {
      id: 'hist-1',
      campaignId: 'campaign-1',
      status: CampaignStatus.CLOSED,
      changedByUserId: 'user-1',
      changedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    expect(history.status).toBe('closed');
  });
});
