import * as domain from '../../src/index';

describe('Domain exports', () => {
  it('exports all repository ports', () => {
    expect(typeof domain.IUserRepository).toBe('symbol');
    expect(typeof domain.ICompanyProfileRepository).toBe('symbol');
    expect(typeof domain.ICampaignRepository).toBe('symbol');
    expect(typeof domain.ITestRepository).toBe('symbol');
    expect(typeof domain.IQuestionRepository).toBe('symbol');
    expect(typeof domain.IAnswerRepository).toBe('symbol');
    expect(typeof domain.IAccessCodeRepository).toBe('symbol');
    expect(typeof domain.IOrderRepository).toBe('symbol');
    expect(typeof domain.IEmailTemplateRepository).toBe('symbol');
    expect(typeof domain.ILandingAdRepository).toBe('symbol');
    expect(typeof domain.ICreditSettingRepository).toBe('symbol');
  });

  it('exports enums as objects', () => {
    expect(domain.UserRole.USER).toBe('user');
    expect(domain.ActivationStatus.ACTIVE).toBe('active');
    expect(domain.CampaignStatus.DRAFT).toBe('draft');
    expect(domain.QuestionType.SINGLE_CHOICE).toBe('single_choice');
  });
});
