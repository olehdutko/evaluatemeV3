import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { IEmailServiceConfigRepository, EmailServiceConfig } from '@evaluateme/domain';

@Injectable()
export class PrismaEmailServiceConfigRepository implements IEmailServiceConfigRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findFirst(): Promise<EmailServiceConfig | null> {
    const row = await this.prisma.emailServiceConfig.findFirst({
      orderBy: { updatedAt: 'desc' },
    });
    return row ? this.toDomain(row) : null;
  }

  async save(config: EmailServiceConfig): Promise<EmailServiceConfig> {
    const row = await this.prisma.emailServiceConfig.upsert({
      where: { id: config.id },
      create: {
        id: config.id,
        provider: config.provider,
        smtpHost: config.smtpHost,
        smtpPort: config.smtpPort,
        smtpUser: config.smtpUser,
        smtpPass: config.smtpPass,
        fromEmail: config.fromEmail,
        secure: config.secure,
        enabled: config.enabled,
        updatedByUserId: config.updatedByUserId,
      },
      update: {
        provider: config.provider,
        smtpHost: config.smtpHost,
        smtpPort: config.smtpPort,
        smtpUser: config.smtpUser,
        smtpPass: config.smtpPass,
        fromEmail: config.fromEmail,
        secure: config.secure,
        enabled: config.enabled,
        updatedByUserId: config.updatedByUserId,
      },
    });
    return this.toDomain(row);
  }

  private toDomain(raw: unknown): EmailServiceConfig {
    const data = raw as Record<string, unknown>;
    return {
      id: data.id as string,
      provider: data.provider as string,
      smtpHost: data.smtpHost as string,
      smtpPort: data.smtpPort as number,
      smtpUser: data.smtpUser as string,
      smtpPass: data.smtpPass as string,
      fromEmail: data.fromEmail as string,
      secure: data.secure as boolean,
      enabled: data.enabled as boolean,
      updatedByUserId: data.updatedByUserId as string,
      createdAt: data.createdAt as Date,
      updatedAt: data.updatedAt as Date,
    };
  }
}
