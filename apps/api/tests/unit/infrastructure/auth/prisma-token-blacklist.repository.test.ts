import { PrismaTokenBlacklist } from '../../../../src/infrastructure/prisma/repositories/prisma-token-blacklist.repository';
import { createHash } from 'crypto';

function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

class FakePrismaService {
  tokenBlacklist = {
    rows: new Map<string, { id: string; tokenHash: string; expiresAt: Date | null; createdAt: Date; updatedAt: Date }>(),

    async upsert(args: {
      where: { tokenHash: string };
      create: { tokenHash: string; expiresAt: Date | null };
      update: { expiresAt: Date | null };
    }): Promise<{ id: string; tokenHash: string; expiresAt: Date | null; createdAt: Date; updatedAt: Date }> {
      const existing = this.rows.get(args.where.tokenHash);
      if (existing) {
        existing.expiresAt = args.update.expiresAt ?? existing.expiresAt;
        existing.updatedAt = new Date();
        return existing;
      }
      const created = {
        id: 'id-' + args.create.tokenHash.slice(0, 8),
        tokenHash: args.create.tokenHash,
        expiresAt: args.create.expiresAt ?? null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      this.rows.set(args.create.tokenHash, created);
      return created;
    },

    async findUnique(args: { where: { tokenHash: string } }): Promise<{ id: string; tokenHash: string; expiresAt: Date | null; createdAt: Date; updatedAt: Date } | null> {
      return this.rows.get(args.where.tokenHash) ?? null;
    },

    async delete(args: { where: { tokenHash: string } }): Promise<void> {
      this.rows.delete(args.where.tokenHash);
    },

    async deleteMany(args: { where: { expiresAt: { lt: Date } } }): Promise<{ count: number }> {
      let count = 0;
      for (const [key, row] of this.rows) {
        if (row.expiresAt && row.expiresAt < args.where.expiresAt.lt) {
          this.rows.delete(key);
          count++;
        }
      }
      return { count };
    },
  };
}

describe('PrismaTokenBlacklist', () => {
  let prisma: FakePrismaService;
  let blacklist: PrismaTokenBlacklist;

  beforeEach(() => {
    prisma = new FakePrismaService();
    blacklist = new PrismaTokenBlacklist(prisma as never);
  });

  afterEach(() => {
    blacklist.onModuleDestroy();
  });

  it('stores token by SHA-256 hash', async () => {
    const token = 'refresh-token-1';
    await blacklist.add(token, Date.now() / 1000 + 3600);
    const stored = prisma.tokenBlacklist.rows.get(hashToken(token));
    expect(stored).toBeDefined();
    expect(stored?.tokenHash).toBe(hashToken(token));
  });

  it('returns true for blacklisted token', async () => {
    const token = 'refresh-token-2';
    await blacklist.add(token, Date.now() / 1000 + 3600);
    await expect(blacklist.has(token)).resolves.toBe(true);
  });

  it('returns false for non-blacklisted token', async () => {
    await expect(blacklist.has('not-listed')).resolves.toBe(false);
  });

  it('removes expired token during has check', async () => {
    const token = 'refresh-token-3';
    await blacklist.add(token, Date.now() / 1000 - 1);
    await expect(blacklist.has(token)).resolves.toBe(false);
    expect(prisma.tokenBlacklist.rows.has(hashToken(token))).toBe(false);
  });

  it('cleans up expired entries', async () => {
    const expired = 'expired-token';
    const valid = 'valid-token';
    await blacklist.add(expired, Date.now() / 1000 - 1);
    await blacklist.add(valid, Date.now() / 1000 + 3600);

    // Access private method through cast for test purposes
    await (blacklist as unknown as { removeExpired: () => Promise<void> }).removeExpired();

    expect(prisma.tokenBlacklist.rows.has(hashToken(expired))).toBe(false);
    expect(prisma.tokenBlacklist.rows.has(hashToken(valid))).toBe(true);
  });
});
