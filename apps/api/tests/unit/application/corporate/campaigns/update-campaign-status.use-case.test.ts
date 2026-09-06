import { UpdateCampaignStatusUseCase } from '../../../../../src/application/corporate/campaigns/update-campaign-status.use-case';
import { ICampaignRepository, ICompanyProfileRepository, Campaign, CampaignStatus, CampaignHistory } from '@evaluateme/domain';

const now = new Date();

const companyProfile = {
  id: 'company-1',
  userId: 'user-1',
  companyName: 'Test Corp',
  address: null,
  phone: null,
  country: null,
  occupation: null,
  availableTests: 10,
  availableAccessCodes: 100,
  createdAt: now,
  updatedAt: now,
};

class FakeCompanyProfileRepository implements ICompanyProfileRepository {
  findById(id: string) {
    return Promise.resolve(id === companyProfile.id ? companyProfile : null);
  }
  findByUserId() {
    return Promise.resolve(null);
  }
  save(p: typeof companyProfile) {
    return Promise.resolve(p);
  }
}

function makeCampaign(status: CampaignStatus): Campaign {
  return {
    id: 'campaign-1',
    companyId: 'company-1',
    name: 'Test',
    description: null,
    notes: null,
    status,
    createdByUserId: 'user-1',
    startDate: null,
    endDate: null,
    createdAt: now,
    updatedAt: now,
  };
}

class FakeCampaignRepository implements ICampaignRepository {
  campaign: Campaign = makeCampaign(CampaignStatus.OPEN);
  savedHistory: CampaignHistory[] = [];

  findById(id: string) {
    return Promise.resolve(id === this.campaign.id ? this.campaign : null);
  }
  findByCompanyId() {
    return Promise.resolve([]);
  }
  findByCompanyIdAndStatus() {
    return Promise.resolve([]);
  }
  save(c: Campaign) {
    this.campaign = c;
    return Promise.resolve(c);
  }
  saveHistory(h: CampaignHistory) {
    this.savedHistory.push(h);
    return Promise.resolve(h);
  }
  findHistoryByCampaignId() {
    return Promise.resolve([]);
  }
}

describe('UpdateCampaignStatusUseCase', () => {
  it('transitions open → closed and records history', async () => {
    const repo = new FakeCampaignRepository();
    const useCase = new UpdateCampaignStatusUseCase(repo, new FakeCompanyProfileRepository());

    const result = await useCase.execute({
      userId: 'user-1',
      companyId: 'company-1',
      campaignId: 'campaign-1',
      newStatus: CampaignStatus.CLOSED,
    });

    expect(result.data.status).toBe(CampaignStatus.CLOSED);
    expect(repo.savedHistory).toHaveLength(1);
    expect(repo.savedHistory[0].action).toBe('status_changed');
  });

  it('rejects invalid transitions', async () => {
    const repo = new FakeCampaignRepository();
    repo.campaign = makeCampaign(CampaignStatus.OPEN);
    const useCase = new UpdateCampaignStatusUseCase(repo, new FakeCompanyProfileRepository());

    await expect(
      useCase.execute({
        userId: 'user-1',
        companyId: 'company-1',
        campaignId: 'campaign-1',
        newStatus: CampaignStatus.ARCHIVED,
      }),
    ).rejects.toThrow();
  });
});
