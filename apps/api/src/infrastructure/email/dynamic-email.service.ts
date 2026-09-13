import { Inject, Injectable, Logger } from '@nestjs/common';
import { IEmailServiceConfigRepository } from '@evaluateme/domain';
import { IEmailService, EmailMessage } from '@evaluateme/domain';
import * as nodemailer from 'nodemailer';

export interface EmailServiceConfigInput {
  provider: string;
  smtpHost: string;
  smtpPort: number;
  smtpUser: string;
  smtpPass: string;
  fromEmail: string;
  secure: boolean;
  enabled: boolean;
}

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

  private static createTransporter(config: EmailServiceConfigInput): nodemailer.Transporter {
    return nodemailer.createTransport({
      host: config.smtpHost,
      port: config.smtpPort,
      secure: config.secure,
      auth: {
        user: config.smtpUser,
        pass: config.smtpPass,
      },
    });
  }

  static normalizeSmtpError(err: unknown, host: string, port: number): Error {
    const raw = err instanceof Error ? err.message : String(err);
    const lowered = raw.toLowerCase();

    if (lowered.includes('invalid login') || lowered.includes('535')) {
      return new Error('SMTP authentication failed. Check your username and App Password.');
    }
    if (lowered.includes('etimedout') || lowered.includes('ehostunreach') || lowered.includes('econnrefused') || lowered.includes('enotfound')) {
      return new Error(`Cannot reach SMTP server (${host}:${port}). Check host and port.`);
    }
    if (lowered.includes('self signed certificate') || lowered.includes('certificate')) {
      return new Error('TLS certificate error. Try toggling Secure/TLS or use a trusted network.');
    }
    return new Error(`SMTP check failed: ${raw}`);
  }

  async verifyConfig(config: EmailServiceConfigInput): Promise<void> {
    const transporter = DynamicEmailService.createTransporter(config);
    try {
      await transporter.verify();
    } catch (err) {
      throw DynamicEmailService.normalizeSmtpError(err, config.smtpHost, config.smtpPort);
    }
  }

  private async ensureInitialized(): Promise<void> {
    if (this.initialized) {
      return;
    }

    const config = await this.repository.findFirst();
    if (config && config.enabled) {
      try {
        this.transporter = DynamicEmailService.createTransporter(config as EmailServiceConfigInput);
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
