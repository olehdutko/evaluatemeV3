import * as fs from 'fs';
import * as path from 'path';

describe('Domain import lint', () => {
  it('does not import forbidden packages into packages/domain/src', () => {
    const domainPath = path.resolve(__dirname, '../../src');
    const forbidden = ['@nestjs', '@prisma/client', 'next', 'react'];

    function scanDir(dir: string): string[] {
      const files = fs.readdirSync(dir, { withFileTypes: true });
      const tsFiles = files
        .filter((entry) => entry.isFile() && entry.name.endsWith('.ts'))
        .map((entry) => path.join(dir, entry.name));
      const subDirs = files
        .filter((entry) => entry.isDirectory())
        .flatMap((entry) => scanDir(path.join(dir, entry.name)));
      return [...tsFiles, ...subDirs];
    }

    const files = scanDir(domainPath);
    expect(files.length).toBeGreaterThan(0);

    const violations: string[] = [];
    for (const file of files) {
      const content = fs.readFileSync(file, 'utf-8');
      const lines = content.split('\n');
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (!line.startsWith('import ')) continue;
        for (const pkg of forbidden) {
          if (line.includes(pkg)) {
            violations.push(`${file}:${i + 1} imports ${pkg}`);
          }
        }
      }
    }

    expect(violations).toEqual([]);
  });
});
