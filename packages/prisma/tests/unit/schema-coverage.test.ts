import { readFileSync } from 'fs';
import { resolve } from 'path';

describe('Prisma schema coverage', () => {
  const schemaPath = resolve(__dirname, '../../schema.prisma');
  const schema = readFileSync(schemaPath, 'utf-8');

  it('defines all v3 entities', () => {
    const requiredModels = [
      'model User',
      'model CompanyProfile',
      'model Campaign',
      'model CampaignHistory',
      'model Technology',
      'model Test',
      'model Question',
      'model Answer',
      'model FreeSampleQuestion',
      'model UserSession',
      'model UserResult',
      'model CandidateSession',
      'model CandidateResult',
      'model AccessCode',
      'model Order',
      'model EmailTemplate',
      'model LandingAd',
      'model CreditSetting',
    ];

    for (const model of requiredModels) {
      expect(schema).toContain(model);
    }
  });

  it('declares natural-key unique constraints for test/question/answer', () => {
    expect(schema).toMatch(/@@unique\(\[technologyId, title\]\)/);
    expect(schema).toMatch(/@@unique\(\[testId, orderIndex\]\)/);
    expect(schema).toMatch(/@@unique\(\[questionId, orderIndex\]\)/);
  });
});
