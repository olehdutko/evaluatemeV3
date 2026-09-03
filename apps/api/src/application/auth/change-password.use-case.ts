import { Inject, Injectable } from '@nestjs/common';
import { IUserRepository, IPasswordHasher, IEmailService, IEmailTemplateRepository } from '@evaluateme/domain';
import { BadRequestError, NotFoundError, UnauthorizedError } from '../../infrastructure/errors/app-error';
import { validatePasswordQuality } from '../../lib/schemas/password.schema';

export interface ChangePasswordInput {
  userId: string;
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

@Injectable()
export class ChangePasswordUseCase {
  constructor(
    @Inject(IUserRepository) private readonly userRepository: IUserRepository,
    @Inject(IPasswordHasher) private readonly passwordHasher: IPasswordHasher,
    @Inject(IEmailService) private readonly emailService: IEmailService,
    @Inject(IEmailTemplateRepository) private readonly emailTemplateRepository: IEmailTemplateRepository,
  ) {}

  async execute(input: ChangePasswordInput): Promise<{ success: true; data: { updatedAt: string } }> {
    if (input.newPassword !== input.confirmPassword) {
      throw new BadRequestError({ confirmPassword: ['Passwords do not match'] });
    }

    const quality = validatePasswordQuality(input.newPassword);
    if (!quality.valid) {
      throw new BadRequestError({ newPassword: quality.errors });
    }

    const user = await this.userRepository.findById(input.userId);
    if (!user) {
      throw new NotFoundError('User', input.userId);
    }

    if (!user.passwordHash) {
      throw new BadRequestError({ currentPassword: ['Account has no password set. Use password reset instead.'] });
    }

    const valid = await this.passwordHasher.verify(input.currentPassword, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedError('Current password is incorrect.');
    }

    const newHash = await this.passwordHasher.hash(input.newPassword);
    const saved = await this.userRepository.save({
      ...user,
      passwordHash: newHash,
      legacyMd5Hash: null,
      updatedAt: new Date(),
    });

    await this.sendPasswordChangedEmail(user.email, user.username ?? user.email);

    return {
      success: true,
      data: { updatedAt: saved.updatedAt.toISOString() },
    };
  }

  private async sendPasswordChangedEmail(to: string, displayName: string): Promise<void> {
    const template = await this.emailTemplateRepository.findByName('password_changed');
    const subject = template?.subject ?? 'Your EvaluateMe.IT password was changed';
    const html = template?.bodyHtml
      ? this.replaceVariables(template.bodyHtml, { userName: displayName })
      : this.defaultHtml(displayName);
    const text = template?.bodyText
      ? this.replaceVariables(template.bodyText, { userName: displayName })
      : this.defaultText(displayName);

    await this.emailService.send({ to, subject, html, text });
  }

  private replaceVariables(template: string, variables: Record<string, string>): string {
    return template.replace(/\{\{(\w+)\}\}/g, (_, key) => variables[key] ?? `{{${key}}}`);
  }

  private defaultHtml(displayName: string): string {
    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Your password was changed</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
  <h2 style="color: #4f46e5;">Password changed</h2>
  <p>Hello ${displayName},</p>
  <p>Your EvaluateMe.IT password was just changed. If this was not you, please contact support immediately.</p>
  <p>Best regards,<br>The EvaluateMe.IT Team</p>
</body>
</html>`;
  }

  private defaultText(displayName: string): string {
    return `Hello ${displayName},

Your EvaluateMe.IT password was just changed. If this was not you, please contact support immediately.

Best regards,
The EvaluateMe.IT Team`;
  }
}
