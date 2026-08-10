import { CompanyProfile } from '../../../src/entities/company-profile.entity';

describe('CompanyProfile entity', () => {
  it('constructs with credit counters', () => {
    const profile: CompanyProfile = {
      id: 'profile-1',
      userId: 'user-1',
      companyName: 'Acme',
      address: null,
      phone: null,
      country: null,
      occupation: null,
      availableTests: 10,
      availableAccessCodes: 50,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    expect(profile.availableTests).toBe(10);
    expect(profile.availableAccessCodes).toBe(50);
  });
});
