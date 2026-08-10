import { readFileSync } from 'fs';
import { resolve } from 'path';

describe('Legacy read-only models', () => {
  const schemaPath = resolve(__dirname, '../../schema.prisma');
  const schema = readFileSync(schemaPath, 'utf-8');

  it('defines read-only legacy models', () => {
    const legacyModels = [
      'model LegacyUser',
      'model LegacyCompany',
      'model LegacyStudent',
      'model LegacyResult',
      'model LegacyCandidate',
      'model LegacyCandidateResult',
    ];

    for (const model of legacyModels) {
      expect(schema).toContain(model);
    }
  });

  it('maps legacy models to original table names', () => {
    expect(schema).toMatch(/@@map\("Users"\)/);
    expect(schema).toMatch(/@@map\("Companies"\)/);
    expect(schema).toMatch(/@@map\("Students"\)/);
    expect(schema).toMatch(/@@map\("Results"\)/);
    expect(schema).toMatch(/@@map\("Candidates"\)/);
    expect(schema).toMatch(/@@map\("Candidates_results"\)/);
  });
});
