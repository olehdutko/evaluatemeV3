import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { IEmailService, EmailMessage } from '@evaluateme/domain';

@Injectable()
export class NodemailerEmailService implements IEmailService {
  private readonly logger = new Logger(NodemailerEmailService.name);
  private readonly transporter: nodemailer.Transporter | null = null;
  private readonly from: string;

  constructor(private readonly configService: ConfigService) {
    const smtpHost = this.configService.get<string | undefined>('SMTP_HOST');
    const smtpPort = this.configService.get<number | undefined>('SMTP_PORT');
    const smtpUser = this.configService.get<string | undefined>('SMTP_USER');
    const smtpPass = this.configService.get<string | undefined>('SMTP_PASS');
    this.from = this.configService.get<string | undefined>('EMAIL_FROM') ?? 'noreply@evaluateme.it';

    if (smtpHost && smtpPort && smtpUser && smtpPass) {
      this.transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpPort === 465,
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
      });
    } else {
      this.logger.warn('SMTP configuration incomplete; emails will not be sent.');
    }
  }

  async send(message: EmailMessage): Promise<void> {
    if (!this.transporter) {
      this.logger.warn(`Email not sent (no SMTP config): to=${message.to}, subject=${message.subject}`);
      return;
    }

    await this.transporter.sendMail({
      from: this.from,
      to: message.to,
      subject: message.subject,
      text: message.text,
      html: message.html,
    });
  }
}
