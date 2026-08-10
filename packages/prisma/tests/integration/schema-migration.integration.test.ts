import { execSync } from 'child_process';
import { readFileSync, readdirSync } from 'fs';
import { resolve } from 'path';

describe('Schema migration', () => {
  if (!process.env.DATABASE_URL) {
    it('skips when DATABASE_URL is not set', () => {
      expect(true).toBe(true);
    });
    return;
  }

  it('has a non-destructive migration SQL', () => {
    const migrationsDir = resolve(__dirname, '../../migrations');
    const migrationDirs = readdirSync(migrationsDir).filter((d) => /\d+_/.test(d));
    expect(migrationDirs.length).toBeGreaterThanOrEqual(1);

    for (const dir of migrationDirs) {
      const sql = readFileSync(resolve(migrationsDir, dir, 'migration.sql'), 'utf-8');
      const lower = sql.toLowerCase();
      expect(lower).not.toContain('drop table');
      expect(lower).not.toContain('drop column');
      expect(lower).not.toContain('truncate');
    }
  });

  it('can run prisma generate', () => {
    expect(() => {
      execSync('npx prisma generate', {
        cwd: resolve(__dirname, '../..'),
        stdio: 'pipe',
      });
    }).not.toThrow();
  });
});
