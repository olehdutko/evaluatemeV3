export interface EmailMessage {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export const IEmailService = Symbol('IEmailService');

export interface IEmailService {
  send(message: EmailMessage): Promise<void>;
}
