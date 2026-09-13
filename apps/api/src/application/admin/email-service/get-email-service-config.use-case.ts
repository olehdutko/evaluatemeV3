import { Inject, Injectable } from '@nestjs/common';
import { IEmailServiceConfigRepository, EmailServiceConfig } from '@evaluateme/domain';

export interface GetEmailServiceConfigOutput {
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
  } | null;
}

@Injectable()
export class GetEmailServiceConfigUseCase {
  constructor(
    @Inject(IEmailServiceConfigRepository) private readonly repository: IEmailServiceConfigRepository,
  ) {}

  async execute(): Promise<GetEmailServiceConfigOutput> {
    const config = await this.repository.findFirst();
    return {
      success: true,
      data: config ? this.toDto(config) : null,
    };
  }

  private toDto(config: EmailServiceConfig): GetEmailServiceConfigOutput['data'] {
    return {
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
      updatedAt: config.updatedAt.toISOString(),
    };
  }
}
