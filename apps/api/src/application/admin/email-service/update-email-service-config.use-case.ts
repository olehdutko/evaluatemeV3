import { Inject, Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { IEmailServiceConfigRepository, EmailServiceConfig } from '@evaluateme/domain';
import { BadRequestError } from '../../../infrastructure/errors/app-error';

export interface UpdateEmailServiceConfigInput {
  provider: string;
  smtpHost: string;
  smtpPort: number;
  smtpUser: string;
  smtpPass: string;
  fromEmail: string;
  secure: boolean;
  enabled: boolean;
  updatedByUserId: string;
}

export interface UpdateEmailServiceConfigOutput {
  success: true;
  data: {
    id: string;
    provider: string;
    smtpHost: string;
    smtpPort: number;
    smtpUser: string;
    smtpPass: string;
    fromEmail: string;
    secure: boolean;
    enabled: boolean;
    updatedByUserId: string;
    updatedAt: string;
  };
}

@Injectable()
export class UpdateEmailServiceConfigUseCase {
  constructor(
    @Inject(IEmailServiceConfigRepository) private readonly repository: IEmailServiceConfigRepository,
  ) {}

  async execute(input: UpdateEmailServiceConfigInput): Promise<UpdateEmailServiceConfigOutput> {
    if (!input.smtpHost.trim()) {
      throw new BadRequestError({ smtpHost: ['SMTP host is required'] });
    }
    if (!input.smtpUser.trim()) {
      throw new BadRequestError({ smtpUser: ['SMTP user is required'] });
    }
    if (!input.smtpPass) {
      throw new BadRequestError({ smtpPass: ['SMTP password is required'] });
    }
    if (!input.fromEmail.trim()) {
      throw new BadRequestError({ fromEmail: ['From email is required'] });
    }
    if (Number.isNaN(input.smtpPort) || input.smtpPort < 1 || input.smtpPort > 65535) {
      throw new BadRequestError({ smtpPort: ['SMTP port must be between 1 and 65535'] });
    }

    const existing = await this.repository.findFirst();
    const now = new Date();
    const config: EmailServiceConfig = {
      id: existing?.id ?? randomUUID(),
      provider: input.provider.trim() || 'custom',
      smtpHost: input.smtpHost.trim(),
      smtpPort: input.smtpPort,
      smtpUser: input.smtpUser.trim(),
      smtpPass: input.smtpPass,
      fromEmail: input.fromEmail.trim(),
      secure: input.secure,
      enabled: input.enabled,
      updatedByUserId: input.updatedByUserId,
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
    };

    const saved = await this.repository.save(config);
    return {
      success: true,
      data: {
        id: saved.id,
        provider: saved.provider,
        smtpHost: saved.smtpHost,
        smtpPort: saved.smtpPort,
        smtpUser: saved.smtpUser,
        smtpPass: saved.smtpPass,
        fromEmail: saved.fromEmail,
        secure: saved.secure,
        enabled: saved.enabled,
        updatedByUserId: saved.updatedByUserId,
        updatedAt: saved.updatedAt.toISOString(),
      },
    };
  }
}
