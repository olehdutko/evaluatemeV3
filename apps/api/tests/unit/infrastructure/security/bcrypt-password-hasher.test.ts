import { BcryptPasswordHasher } from '../../../../src/infrastructure/security/bcrypt-password-hasher';

describe('BcryptPasswordHasher', () => {
  const hasher = new BcryptPasswordHasher();

  it('hashes and verifies a password', async () => {
    const password = 'Password123';
    const hash = await hasher.hash(password);
    expect(hash).not.toBe(password);
    expect(await hasher.verify(password, hash)).toBe(true);
    expect(await hasher.verify('wrong', hash)).toBe(false);
  });

  it('detects legacy MD5 hashes', () => {
    expect(hasher.isLegacyHash('5f4dcc3b5aa765d61d8327deb882cf99')).toBe(true);
    expect(hasher.isLegacyHash('$2b$12$xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx')).toBe(false);
  });
});
