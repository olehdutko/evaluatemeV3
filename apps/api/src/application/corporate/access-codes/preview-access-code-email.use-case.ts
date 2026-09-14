import { Inject, Injectable } from '@nestjs/common';
import {
  IAccessCodeRepository,
  ICompanyProfileRepository,
  IEmailTemplateRepository,
  IQuestionSetRepository,
} from '@evaluateme/domain';
import { NotFoundError, BadRequestError } from '../../../infrastructure/errors/app-error';
import { renderAccessCodeEmail, getTestInvitationTemplateName } from './access-code-email-renderer';

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

    const template = await this.templateRepository.findByName(getTestInvitationTemplateName());
    if (!template) {
      throw new NotFoundError('email template', getTestInvitationTemplateName());
    }

    const questionSet = code.questionSetId ? await this.questionSetRepository.findById(code.questionSetId) : null;
    const frontendOrigin = process.env.WEB_ORIGIN || 'http://localhost:4000';
    const { subject, html } = renderAccessCodeEmail({
      template,
      questionSet,
      accessCode: {
        code: code.code,
        testeeName: code.testeeName,
        testeeEmail: recipientEmail,
      },
      frontendOrigin,
    });

    return {
      success: true,
      data: { to: recipientEmail, subject, html },
    };
  }
}
