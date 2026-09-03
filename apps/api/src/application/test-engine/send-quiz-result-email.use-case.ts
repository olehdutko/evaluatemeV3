import { Inject, Injectable } from '@nestjs/common';
import {
  IEmailService,
  IEmailTemplateRepository,
  IUserRepository,
} from '@evaluateme/domain';

export interface SendQuizResultEmailInput {
  userId: string;
  resultCode: string;
  technologyName: string;
  score: number;
  maxScore: number;
}

@Injectable()
export class SendQuizResultEmailUseCase {
  constructor(
    @Inject(IUserRepository) private readonly userRepository: IUserRepository,
    @Inject(IEmailTemplateRepository) private readonly templateRepository: IEmailTemplateRepository,
    @Inject(IEmailService) private readonly emailService: IEmailService,
  ) {}

  async execute(input: SendQuizResultEmailInput): Promise<{ success: true }> {
    const user = await this.userRepository.findById(input.userId);
    if (!user || !user.email) {
      throw new Error('User not found or has no email');
    }

    const template = await this.templateRepository.findByName('quiz_result');
    if (!template) {
      throw new Error('quiz_result email template not found');
    }

    const resultLink = `${process.env.WEB_ORIGIN || 'http://localhost:4000'}/result?code=${encodeURIComponent(input.resultCode)}`;
    const name = user.firstName || user.username || user.email;

    const html = template.bodyHtml
      .replace(/{{userName}}/g, name)
      .replace(/{{technologyName}}/g, input.technologyName)
      .replace(/{{score}}/g, String(input.score))
      .replace(/{{maxScore}}/g, String(input.maxScore))
      .replace(/{{resultCode}}/g, input.resultCode)
      .replace(/{{resultLink}}/g, resultLink);

    const text = (template.bodyText || '')
      .replace(/{{userName}}/g, name)
      .replace(/{{technologyName}}/g, input.technologyName)
      .replace(/{{score}}/g, String(input.score))
      .replace(/{{maxScore}}/g, String(input.maxScore))
      .replace(/{{resultCode}}/g, input.resultCode)
      .replace(/{{resultLink}}/g, resultLink);

    await this.emailService.send({ to: user.email, subject: template.subject, html, text });

    return { success: true };
  }
}
