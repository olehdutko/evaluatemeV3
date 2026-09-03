import { Injectable, Logger } from '@nestjs/common';
import { IEmailService, EmailMessage } from '@evaluateme/domain';

@Injectable()
export class ConsoleEmailService implements IEmailService {
  private readonly logger = new Logger(ConsoleEmailService.name);

  async send(message: EmailMessage): Promise<void> {
    this.logger.log('--- EMAIL ---');
    this.logger.log(`To: ${message.to}`);
    this.logger.log(`Subject: ${message.subject}`);
    if (message.text) {
      this.logger.log(`Text:\n${message.text}`);
    }
    this.logger.log(`HTML:\n${message.html}`);
    this.logger.log('-------------');
  }
}
