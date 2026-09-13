import { Inject, Injectable, Logger } from '@nestjs/common';
import { IEmailServiceConfigRepository } from '@evaluateme/domain';
import { IEmailService, EmailMessage } from '@evaluateme/domain';
import * as nodemailer from 'nodemailer';

@Injectable()
export class DynamicEmailService implements IEmailService {
  private readonly logger = new Logger(DynamicEmailService.name);
  private transporter: nodemailer.Transporter | null = null;
  private fromEmail = 'noreply@evaluateme.it';
  private enabled = false;
  private initialized = false;

  constructor(
    @Inject(IEmailServiceConfigRepository) private readonly repository: IEmailServiceConfigRepository,
  ) {}

  async send(message: EmailMessage): Promise<void> {
    await this.ensureInitialized();

    if (!this.enabled || !this.transporter) {
      this.logger.warn(`Email not sent (service disabled or unconfigured): to=${message.to}, subject=${message.subject}`);
      return;
    }

    await this.transporter.sendMail({
      from: this.fromEmail,
      to: message.to,
      subject: message.subject,
      text: message.text,
      html: message.html,
    });
  }

  async sendTest(to: string): Promise<void> {
    await this.ensureInitialized();

    if (!this.enabled || !this.transporter) {
      throw new Error('Email service is not enabled or configured');
    }

    await this.transporter.sendMail({
      from: this.fromEmail,
      to,
      subject: 'EvaluateMe email service test',
      text: 'This is a test email from EvaluateMe. If you received it, your SMTP settings are correct.',
      html: '<p>This is a test email from <strong>EvaluateMe</strong>. If you received it, your SMTP settings are correct.</p>',
    });
  }

  private async ensureInitialized(): Promise<void> {
    if (this.initialized) {
      return;
    }

    const config = await this.repository.findFirst();
    if (config && config.enabled) {
      try {
        this.transporter = nodemailer.createTransport({
          host: config.smtpHost,
          port: config.smtpPort,
          secure: config.secure,
          auth: {
            user: config.smtpUser,
            pass: config.smtpPass,
          },
        });
        this.fromEmail = config.fromEmail;
        this.enabled = true;
      } catch (err) {
        this.logger.error(`Failed to create email transporter: ${err instanceof Error ? err.message : String(err)}`);
        this.transporter = null;
        this.enabled = false;
      }
    }

    this.initialized = true;
  }

  async refresh(): Promise<void> {
    this.initialized = false;
    this.transporter = null;
    this.enabled = false;
    await this.ensureInitialized();
  }
}
