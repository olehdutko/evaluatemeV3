import { Inject, Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import {
  IAccessCodeRepository,
  ICompanyProfileRepository,
  IEmailService,
  ICampaignRepository,
  ICreditSettingRepository,
  IEmailTemplateRepository,
  IQuestionSetRepository,
  CampaignHistory,
} from '@evaluateme/domain';
import { NotFoundError, BadRequestError, PaymentRequiredError } from '../../../infrastructure/errors/app-error';

const DEFAULT_ACCESS_CODE_PRICE = 1;
const ACCESS_CODE_PRICE_KEY = 'company_access_code_price';
const FALLBACK_ACCESS_CODE_PRICE_KEY = 'access_code_price_credits';
const TEST_INVITATION_TEMPLATE_NAME = 'test_invitation';

export interface SendAccessCodeInput {
  userId: string;
  companyId: string;
  accessCodeId: string;
  email?: string;
}

export interface SendAccessCodeOutput {
  sentAt: string;
  activatedCount: number;
  remaining: number | null;
  price: number;
}

@Injectable()
export class SendAccessCodeUseCase {
  constructor(
    @Inject(IAccessCodeRepository) private readonly accessCodeRepository: IAccessCodeRepository,
    @Inject(ICompanyProfileRepository) private readonly companyProfileRepository: ICompanyProfileRepository,
    @Inject(IEmailService) private readonly emailService: IEmailService,
    @Inject(ICampaignRepository) private readonly campaignRepository: ICampaignRepository,
    @Inject(ICreditSettingRepository) private readonly creditSettingRepository: ICreditSettingRepository,
    @Inject(IEmailTemplateRepository) private readonly templateRepository: IEmailTemplateRepository,
    @Inject(IQuestionSetRepository) private readonly questionSetRepository: IQuestionSetRepository,
  ) {}

  async execute(input: SendAccessCodeInput): Promise<{ success: true; data: SendAccessCodeOutput }> {
    const profile = await this.companyProfileRepository.findById(input.companyId);
    if (!profile || profile.userId !== input.userId) {
      throw new NotFoundError('company profile');
    }

    const code = await this.accessCodeRepository.findById(input.accessCodeId);
    if (!code || code.companyId !== input.companyId) {
      throw new NotFoundError('access code');
    }
    if (code.status !== 'active') {
      throw new BadRequestError({ accessCode: ['Access code is not active'] });
    }
    if (code.sentAt) {
      throw new BadRequestError({ accessCode: ['Access code has already been sent'] });
    }

    const recipientEmail = input.email ?? code.testeeEmail ?? null;
    if (!recipientEmail) {
      throw new BadRequestError({ email: ['Recipient email is required'] });
    }

    const activatedCount = await this.accessCodeRepository.countSentByCompanyId(input.companyId);
    const limit = profile.availableAccessCodes;
    const price = await this.resolveAccessCodePrice();
    // eslint-disable-next-line no-console
    console.log('[SendAccessCode] profile.availableAccessCodes', limit, 'price', price);

    if (limit !== -1 && limit < price) {
      throw new PaymentRequiredError(
        `Insufficient access code credits: ${limit} available, ${price} required.`,
      );
    }

    const template = await this.templateRepository.findByName(TEST_INVITATION_TEMPLATE_NAME);
    if (!template) {
      throw new NotFoundError('email template', TEST_INVITATION_TEMPLATE_NAME);
    }

    const questionSet = code.questionSetId ? await this.questionSetRepository.findById(code.questionSetId) : null;
    const testName = questionSet?.title ?? 'the assessment';
    const candidateName = code.testeeName ?? recipientEmail;
    const frontendOrigin = process.env.WEB_ORIGIN || 'http://localhost:4000';
    const testLink = `${frontendOrigin}/tests/start?accessCode=${encodeURIComponent(code.code)}`;

    const subject = this.applyTemplate(template.subject, { candidateName, testName, testLink, accessCode: code.code }, false);
    const html = this.applyTemplate(template.bodyHtml, { candidateName, testName, testLink, accessCode: code.code }, true);
    const text = template.bodyText
      ? this.applyTemplate(template.bodyText, { candidateName, testName, testLink, accessCode: code.code }, false)
      : undefined;

    const now = new Date();
    await this.emailService.send({
      to: recipientEmail,
      subject,
      html,
      text,
    });

    // Deduct the configured access code price from company credits only when the code is actually used (sent).
    if (limit !== -1) {
      const newBalance = Math.max(0, profile.availableAccessCodes - price);
      // eslint-disable-next-line no-console
      console.log('[SendAccessCode] deducting', price, 'new balance', newBalance);
      await this.companyProfileRepository.save({
        ...profile,
        availableAccessCodes: newBalance,
        updatedAt: now,
      });
    }

    const updated = await this.accessCodeRepository.save({
      ...code,
      sentAt: now,
      sentToEmail: recipientEmail,
      updatedAt: now,
    });

    const remaining = limit === -1
      ? null
      : Math.max(0, limit - price);

    if (code.campaignId) {
      const history: CampaignHistory = {
        id: randomUUID(),
        campaignId: code.campaignId,
        action: 'access_code_sent',
        status: null,
        changedByUserId: input.userId,
        metadata: JSON.stringify({ accessCodeId: code.id, recipientEmail }),
        changedAt: now,
        createdAt: now,
        updatedAt: now,
      };
      await this.campaignRepository.saveHistory(history);
    }

    return {
      success: true,
      data: {
        sentAt: updated.sentAt!.toISOString(),
        activatedCount: Number(activatedCount) + 1,
        remaining: Number(remaining),
        price,
      },
    };
  }

  private async resolveAccessCodePrice(): Promise<number> {
    let setting = await this.creditSettingRepository.findByKey(ACCESS_CODE_PRICE_KEY);
    if (!setting) {
      setting = await this.creditSettingRepository.findByKey(FALLBACK_ACCESS_CODE_PRICE_KEY);
    }
    if (!setting) {
      return DEFAULT_ACCESS_CODE_PRICE;
    }
    const parsed = Number(setting.value);
    return Number.isNaN(parsed) || parsed < 0 ? DEFAULT_ACCESS_CODE_PRICE : parsed;
  }

  private applyTemplate(
    template: string,
    values: { candidateName: string; testName: string; testLink: string; accessCode: string },
    convertNewlinesToHtml: boolean,
  ): string {
    let result = template
      .replace(/{{candidateName}}/g, values.candidateName)
      .replace(/{{testName}}/g, values.testName)
      .replace(/{{testLink}}/g, values.testLink)
      .replace(/{{accessCode}}/g, values.accessCode);
    if (convertNewlinesToHtml) {
      result = result.replace(/\n/g, '<br>');
    }
    return result;
  }
}
