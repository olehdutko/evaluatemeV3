import { Inject, Injectable } from '@nestjs/common';
import { IAccessCodeRepository, ICompanyProfileRepository, IEmailService } from '@evaluateme/domain';
import { NotFoundError, BadRequestError } from '../../../infrastructure/errors/app-error';

export interface SendAccessCodeInput {
  userId: string;
  companyId: string;
  accessCodeId: string;
  email: string;
}

@Injectable()
export class SendAccessCodeUseCase {
  constructor(
    @Inject(IAccessCodeRepository) private readonly accessCodeRepository: IAccessCodeRepository,
    @Inject(ICompanyProfileRepository) private readonly companyProfileRepository: ICompanyProfileRepository,
    @Inject(IEmailService) private readonly emailService: IEmailService,
  ) {}

  async execute(input: SendAccessCodeInput): Promise<{ success: true; data: { sentAt: string } }> {
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

    const now = new Date();
    await this.emailService.send({
      to: input.email,
      subject: 'Your EvaluateMe assessment access code',
      html: `<p>Use this access code to start your assessment: <strong>${code.code}</strong></p>`,
      text: `Use this access code to start your assessment: ${code.code}`,
    });

    const updated = await this.accessCodeRepository.save({
      ...code,
      sentAt: now,
      sentToEmail: input.email,
      updatedAt: now,
    });

    return {
      success: true,
      data: {
        sentAt: updated.sentAt!.toISOString(),
      },
    };
  }
}
