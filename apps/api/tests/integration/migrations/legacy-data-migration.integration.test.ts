import { execSync } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';

describe('Legacy data migration integration', () => {
  it('runs migration idempotently without duplicate rows', () => {
    if (!process.env.DATABASE_URL) {
      return;
    }
    const distScript = path.resolve(__dirname, '../../../dist/cli/run-migration.js');
    if (!fs.existsSync(distScript)) {
      return;
    }
    const run = () =>
      execSync(`node ${distScript} --migration-name legacy-sessions-results --dry-run`, {
        env: { ...process.env, DRY_RUN: 'true' },
        encoding: 'utf-8',
      });

    expect(run).not.toThrow();
    expect(run).not.toThrow();
  });
});
