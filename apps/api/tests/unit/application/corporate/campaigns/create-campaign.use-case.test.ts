import { CreateCampaignUseCase } from '../../../../../src/application/corporate/campaigns/create-campaign.use-case';
import { ICampaignRepository, ICompanyProfileRepository, Campaign, CampaignHistory, CampaignStatus } from '@evaluateme/domain';

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

class FakeCampaignRepository implements ICampaignRepository {
  savedCampaigns: Campaign[] = [];
  savedHistory: CampaignHistory[] = [];

  findById() {
    return Promise.resolve(null);
  }
  findByCompanyId() {
    return Promise.resolve([]);
  }
  findByCompanyIdAndStatus() {
    return Promise.resolve([]);
  }
  save(c: Campaign) {
    this.savedCampaigns.push(c);
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

describe('CreateCampaignUseCase', () => {
  it('creates an open campaign and records history', async () => {
    const repo = new FakeCampaignRepository();
    const useCase = new CreateCampaignUseCase(repo, new FakeCompanyProfileRepository());

    const result = await useCase.execute({
      userId: 'user-1',
      companyId: 'company-1',
      name: 'Spring Hiring',
      description: 'Desc',
      notes: 'Notes',
    });

    expect(result.success).toBe(true);
    expect(result.data.status).toBe(CampaignStatus.OPEN);
    expect(repo.savedCampaigns).toHaveLength(1);
    expect(repo.savedHistory).toHaveLength(1);
    expect(repo.savedHistory[0].action).toBe('created');
  });

  it('rejects when company profile does not belong to user', async () => {
    const repo = new FakeCampaignRepository();
    const useCase = new CreateCampaignUseCase(repo, new FakeCompanyProfileRepository());

    await expect(
      useCase.execute({
        userId: 'other-user',
        companyId: 'company-1',
        name: 'Spring Hiring',
      }),
    ).rejects.toThrow();
  });
});
