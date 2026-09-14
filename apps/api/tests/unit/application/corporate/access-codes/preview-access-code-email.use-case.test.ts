import { PreviewAccessCodeEmailUseCase } from '../../../../../src/application/corporate/access-codes/preview-access-code-email.use-case';
import {
  IAccessCodeRepository,
  ICompanyProfileRepository,
  IEmailTemplateRepository,
  IQuestionSetRepository,
  AccessCode,
  CompanyProfile,
  EmailTemplate,
  QuestionSet,
} from '@evaluateme/domain';

const now = new Date();

const companyProfile: CompanyProfile = {
  id: 'company-1',
  userId: 'user-1',
  companyName: 'Test Company',
  address: null,
  phone: null,
  country: null,
  occupation: null,
  availableTests: 0,
  availableAccessCodes: 10,
  createdAt: now,
  updatedAt: now,
};

const questionSet: QuestionSet = {
  id: 'qs-1',
  title: 'C# Basics',
  technologyId: 'tech-1',
  status: 'active',
  description: null,
  quizQuestionCount: 20,
  quizDurationMinutes: 40,
  createdByUserId: 'user-1',
  createdAt: now,
  updatedAt: now,
};

const accessCode: AccessCode = {
  id: 'ac-1',
  code: 'CODE-123',
  companyId: companyProfile.id,
  questionSetId: questionSet.id,
  campaignId: null,
  quizId: null,
  sentAt: null,
  sentToEmail: null,
  usedCount: 0,
  maxUses: 1,
  status: 'active',
  expiresAt: null,
  usedAt: null,
  testeeName: 'John Doe',
  testeeEmail: 'john@example.com',
  questionCount: null,
  durationMinutes: null,
  createdAt: now,
  updatedAt: now,
};

const template: EmailTemplate = {
  id: 'et-1',
  name: 'test_invitation',
  subject: 'You are invited to take {{testName}}',
  bodyHtml: '<p>Hello {{candidateName}},</p>\n<p>You are invited to {{testName}}.</p>\n<p><a href="{{testLink}}">Start</a></p>\n<p>Code: {{accessCode}}</p>',
  bodyText: 'Hello {{candidateName}},\nYou are invited to {{testName}}.\nStart: {{testLink}}\nCode: {{accessCode}}',
  variables: { candidateName: 'string', testName: 'string', testLink: 'string', accessCode: 'string' },
  createdAt: now,
  updatedAt: now,
};

class FakeAccessCodeRepository implements IAccessCodeRepository {
  findById(id: string): Promise<AccessCode | null> {
    return Promise.resolve(id === accessCode.id ? accessCode : null);
  }
  findByCode(): Promise<AccessCode | null> {
    return Promise.resolve(null);
  }
  findByCampaignId(): Promise<AccessCode[]> {
    return Promise.resolve([]);
  }
  save(c: AccessCode): Promise<AccessCode> {
    return Promise.resolve(c);
  }
  countByCompanyId(): Promise<number> {
    return Promise.resolve(0);
  }
  countSentByCompanyId(): Promise<number> {
    return Promise.resolve(0);
  }
  countByCampaignId(): Promise<number> {
    return Promise.resolve(0);
  }
  updateStatusByCampaignId(): Promise<number> {
    return Promise.resolve(0);
  }
}

class FakeCompanyProfileRepository implements ICompanyProfileRepository {
  findById(id: string): Promise<CompanyProfile | null> {
    return Promise.resolve(id === companyProfile.id ? companyProfile : null);
  }
  findByUserId(): Promise<CompanyProfile | null> {
    return Promise.resolve(null);
  }
  save(cp: CompanyProfile): Promise<CompanyProfile> {
    return Promise.resolve(cp);
  }
}

class FakeEmailTemplateRepository implements IEmailTemplateRepository {
  findAll(): Promise<EmailTemplate[]> {
    return Promise.resolve([template]);
  }
  findByName(name: string): Promise<EmailTemplate | null> {
    return Promise.resolve(name === template.name ? template : null);
  }
  findById(): Promise<EmailTemplate | null> {
    return Promise.resolve(null);
  }
  save(t: EmailTemplate): Promise<EmailTemplate> {
    return Promise.resolve(t);
  }
}

class FakeQuestionSetRepository implements IQuestionSetRepository {
  findById(id: string): Promise<QuestionSet | null> {
    return Promise.resolve(id === questionSet.id ? questionSet : null);
  }
  findByTechnologyId(): Promise<QuestionSet[]> {
    return Promise.resolve([]);
  }
  findByTechnologyIdAndTitle(): Promise<QuestionSet | null> {
    return Promise.resolve(null);
  }
  save(qs: QuestionSet): Promise<QuestionSet> {
    return Promise.resolve(qs);
  }
  delete(): Promise<void> {
    return Promise.resolve();
  }
}

describe('PreviewAccessCodeEmailUseCase', () => {
  const useCase = new PreviewAccessCodeEmailUseCase(
    new FakeAccessCodeRepository(),
    new FakeCompanyProfileRepository(),
    new FakeEmailTemplateRepository(),
    new FakeQuestionSetRepository(),
  );

  it('renders the admin email template with substituted variables', async () => {
    const result = await useCase.execute({
      userId: companyProfile.userId,
      companyId: companyProfile.id,
      accessCodeId: accessCode.id,
    });

    expect(result.data.to).toBe(accessCode.testeeEmail);
    expect(result.data.subject).toBe('You are invited to take C# Basics');
    expect(result.data.html).toContain('Hello John Doe,');
    expect(result.data.html).toContain('You are invited to C# Basics.');
    expect(result.data.html).toContain('CODE-123');
    expect(result.data.html).toContain('/tests/start?accessCode=CODE-123');
  });

  it('converts newlines to <br> in HTML but keeps them in plain text', async () => {
    const result = await useCase.execute({
      userId: companyProfile.userId,
      companyId: companyProfile.id,
      accessCodeId: accessCode.id,
    });

    expect(result.data.html).toContain('</p><br><p>');
    expect(result.data.html).not.toContain('\n');
    expect(result.data.text).toContain('\n');
    expect(result.data.text).not.toContain('<br>');
  });

  it('throws when the test_invitation template is missing', async () => {
    const emptyTemplateRepository: IEmailTemplateRepository = {
      findAll: () => Promise.resolve([]),
      findByName: () => Promise.resolve(null),
      findById: () => Promise.resolve(null),
      save: (t) => Promise.resolve(t),
    };
    const useCaseWithoutTemplate = new PreviewAccessCodeEmailUseCase(
      new FakeAccessCodeRepository(),
      new FakeCompanyProfileRepository(),
      emptyTemplateRepository,
      new FakeQuestionSetRepository(),
    );

    await expect(
      useCaseWithoutTemplate.execute({
        userId: companyProfile.userId,
        companyId: companyProfile.id,
        accessCodeId: accessCode.id,
      }),
    ).rejects.toThrow('email template');
  });
});
