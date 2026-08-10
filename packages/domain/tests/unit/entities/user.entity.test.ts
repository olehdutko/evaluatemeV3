import { User } from '../../../src/entities/user.entity';
import { ActivationStatus, UserRole } from '../../../src/entities/status.enums';

describe('User entity', () => {
  it('constructs with required fields', () => {
    const user: User = {
      id: 'user-1',
      email: 'a@b.com',
      passwordHash: null,
      legacyMd5Hash: null,
      role: UserRole.USER,
      activationStatus: ActivationStatus.ACTIVE,
      companyProfileId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    expect(user.role).toBe('user');
    expect(user.activationStatus).toBe('active');
  });

  it('supports company role with profile link', () => {
    const user: User = {
      id: 'user-2',
      email: 'company@example.com',
      passwordHash: 'bcrypt-hash',
      legacyMd5Hash: null,
      role: UserRole.COMPANY,
      activationStatus: ActivationStatus.PENDING,
      companyProfileId: 'profile-1',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    expect(user.role).toBe('company');
    expect(user.companyProfileId).toBe('profile-1');
  });
});
