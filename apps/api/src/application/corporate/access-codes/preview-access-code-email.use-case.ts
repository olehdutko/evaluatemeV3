import { Inject, Injectable } from '@nestjs/common';
import {
  IAccessCodeRepository,
  ICompanyProfileRepository,
  IEmailTemplateRepository,
  IQuestionSetRepository,
} from '@evaluateme/domain';
import { NotFoundError, BadRequestError } from '../../../infrastructure/errors/app-error';

const TEST_INVITATION_TEMPLATE_NAME = 'test_invitation';

export interface PreviewAccessCodeEmailInput {
  userId: string;
  companyId: string;
  accessCodeId: string;
  email?: string;
}

export interface PreviewAccessCodeEmailOutput {
  to: string;
  subject: string;
  html: string;
  text: string;
}

@Injectable()
export class PreviewAccessCodeEmailUseCase {
  constructor(
    @Inject(IAccessCodeRepository) private readonly accessCodeRepository: IAccessCodeRepository,
    @Inject(ICompanyProfileRepository) private readonly companyProfileRepository: ICompanyProfileRepository,
    @Inject(IEmailTemplateRepository) private readonly templateRepository: IEmailTemplateRepository,
    @Inject(IQuestionSetRepository) private readonly questionSetRepository: IQuestionSetRepository,
  ) {}

  async execute(input: PreviewAccessCodeEmailInput): Promise<{ success: true; data: PreviewAccessCodeEmailOutput }> {
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

    const recipientEmail = input.email ?? code.testeeEmail ?? null;
    if (!recipientEmail) {
      throw new BadRequestError({ email: ['Recipient email is required'] });
    }

    const template = await this.templateRepository.findByName(TEST_INVITATION_TEMPLATE_NAME);
    const questionSet = code.questionSetId ? await this.questionSetRepository.findById(code.questionSetId) : null;
    const testName = questionSet?.title ?? 'the assessment';
    const candidateName = code.testeeName ?? recipientEmail;
    const frontendOrigin = process.env.WEB_ORIGIN || 'http://localhost:4000';
    const testLink = `${frontendOrigin}/tests/start?accessCode=${encodeURIComponent(code.code)}`;

    const subject = template?.subject.replace(/{{testName}}/g, testName) ?? `You are invited to take ${testName}`;
    const html = template?.bodyHtml
      ? this.applyTemplate(template.bodyHtml, { candidateName, testName, testLink, accessCode: code.code })
      : this.defaultInvitationHtml(candidateName, testName, testLink, code.code);
    const text = template?.bodyText
      ? this.applyTemplate(template.bodyText, { candidateName, testName, testLink, accessCode: code.code })
      : this.defaultInvitationText(candidateName, testName, testLink, code.code);

    return {
      success: true,
      data: { to: recipientEmail, subject, html, text },
    };
  }

  private applyTemplate(
    template: string,
    values: { candidateName: string; testName: string; testLink: string; accessCode: string },
  ): string {
    return template
      .replace(/{{candidateName}}/g, values.candidateName)
      .replace(/{{testName}}/g, values.testName)
      .replace(/{{testLink}}/g, values.testLink)
      .replace(/{{accessCode}}/g, values.accessCode);
  }

  private defaultInvitationHtml(candidateName: string, testName: string, testLink: string, accessCode: string): string {
    return `<p>Hello ${candidateName},</p>
<p>You have been invited to take ${testName}.</p>
<p><a href="${testLink}">Start Test</a></p>
<p>Or use this access code: <strong>${accessCode}</strong></p>`;
  }

  private defaultInvitationText(candidateName: string, testName: string, testLink: string, accessCode: string): string {
    return `Hello ${candidateName},\n\nYou have been invited to take ${testName}.\n\nStart here: ${testLink}\nAccess code: ${accessCode}`;
  }
}
