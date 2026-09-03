import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import {
  IUserRepository,
  IPasswordResetTokenRepository,
  IEmailService,
  IEmailTemplateRepository,
  PasswordResetToken,
} from '@evaluateme/domain';


export interface ForgotPasswordInput {
  email: string;
}

@Injectable()
export class ForgotPasswordUseCase {
  constructor(
    @Inject(IUserRepository) private readonly userRepository: IUserRepository,
    @Inject(IPasswordResetTokenRepository) private readonly tokenRepository: IPasswordResetTokenRepository,
    @Inject(IEmailService) private readonly emailService: IEmailService,
    @Inject(IEmailTemplateRepository) private readonly emailTemplateRepository: IEmailTemplateRepository,
    private readonly configService: ConfigService,
  ) {}

  async execute(input: ForgotPasswordInput): Promise<{ success: true }> {
    const normalizedEmail = input.email.trim().toLowerCase();
    const user = await this.userRepository.findByEmail(normalizedEmail);

    // Always return success to avoid email enumeration.
    if (!user) {
      return { success: true };
    }

    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    const token: PasswordResetToken = {
      id: crypto.randomUUID(),
      userId: user.id,
      tokenHash,
      expiresAt,
      usedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await this.tokenRepository.save(token);

    const frontendUrl = this.configService.get<string | undefined>('FRONTEND_URL') ?? 'http://localhost:4000';
    const resetLink = `${frontendUrl}/reset-password?token=${rawToken}`;
    const displayName = user.username ?? user.email;

    const template = await this.emailTemplateRepository.findByName('password_reset');
    const subject = template?.subject ?? 'Reset your EvaluateMe.IT password';
    const html = template?.bodyHtml
      ? this.replaceVariables(template.bodyHtml, { userName: displayName, resetLink })
      : this.defaultHtml(displayName, resetLink);
    const text = template?.bodyText
      ? this.replaceVariables(template.bodyText, { userName: displayName, resetLink })
      : this.defaultText(displayName, resetLink);

    await this.emailService.send({ to: user.email, subject, html, text });

    return { success: true };
  }

  private replaceVariables(template: string, variables: Record<string, string>): string {
    return template.replace(/\{\{(\w+)\}\}/g, (_, key) => variables[key] ?? `{{${key}}}`);
  }

  private defaultHtml(displayName: string, resetLink: string): string {
    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Reset your password</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
  <h2 style="color: #4f46e5;">Password reset</h2>
  <p>Hello ${displayName},</p>
  <p>We received a request to reset your password. Click the button below to choose a new one:</p>
  <p><a href="${resetLink}" style="background: #4f46e5; color: white; padding: 12px 20px; text-decoration: none; border-radius: 6px; display: inline-block;">Reset Password</a></p>
  <p>Or copy and paste this link into your browser:</p>
  <p><a href="${resetLink}">${resetLink}</a></p>
  <p>If you did not request a password reset, you can safely ignore this email.</p>
  <p>Best regards,<br>The EvaluateMe.IT Team</p>
</body>
</html>`;
  }

  private defaultText(displayName: string, resetLink: string): string {
    return `Password reset

Hello ${displayName},

We received a request to reset your password. Open the link below to choose a new one:

${resetLink}

If you did not request a password reset, you can safely ignore this email.

Best regards,
The EvaluateMe.IT Team`;
  }
}
