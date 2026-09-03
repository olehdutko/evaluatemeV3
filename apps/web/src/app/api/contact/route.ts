import { NextResponse } from 'next/server';
import { z } from 'zod';

export const runtime = 'edge';

const contactRequestSchema = z.object({
  name: z.string().min(1).max(100),
  surname: z.string().max(100).optional(),
  email: z.string().email().max(255),
  phone: z.string().max(50).optional(),
  message: z.string().min(1).max(5000),
});

interface ContactRequest {
  name: string;
  surname?: string;
  email: string;
  phone?: string;
  message: string;
}

async function sendAdminNotificationEmail(request: ContactRequest): Promise<void> {
  const adminEmail = process.env.CONTACT_ADMIN_EMAIL;
  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = process.env.SMTP_PORT ? Number.parseInt(process.env.SMTP_PORT, 10) : undefined;
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;

  const fullName = [request.name, request.surname].filter(Boolean).join(' ');
  const subject = `EvaluateMe.IT contact form: ${fullName}`;
  const textBody = [
    `Name: ${fullName}`,
    `Email: ${request.email}`,
    request.phone ? `Phone: ${request.phone}` : '',
    '',
    'Message:',
    request.message,
  ]
    .filter(Boolean)
    .join('\n');

  const htmlBody = `<html><body>
      <p><strong>Name:</strong> ${escapeHtml(fullName)}</p>
      <p><strong>Email:</strong> ${escapeHtml(request.email)}</p>
      ${request.phone ? `<p><strong>Phone:</strong> ${escapeHtml(request.phone)}</p>` : ''}
      <p><strong>Message:</strong></p>
      <p>${escapeHtml(request.message).replace(/\n/g, '<br/>')}</p>
    </body></html>`;

  if (!adminEmail || !smtpHost || !smtpPort || !smtpUser || !smtpPass) {
    // No mail transport configured. Log to stderr so the message is not lost.
    const message = buildRawEmailMessage(adminEmail ?? 'admin@evaluateme.it', subject, textBody, htmlBody, request.email);
    console.warn('Contact form submission (email not configured):', message);
    return;
  }

  const smtpResponse = await sendSmtpMessage(smtpHost, smtpPort, smtpUser, smtpPass, adminEmail, request.email, subject, textBody, htmlBody);
  if (!smtpResponse.ok) {
    throw new Error(`SMTP request failed: ${smtpResponse.status}`);
  }
}

async function sendSmtpMessage(
  host: string,
  port: number,
  user: string,
  pass: string,
  to: string,
  replyTo: string,
  subject: string,
  textBody: string,
  htmlBody: string,
): Promise<Response> {
  // Edge runtime does not include nodemailer, so we use a lightweight SMTP relay
  // endpoint. If a custom SMTP_ENDPOINT is provided, POST the message there.
  const endpoint = process.env.SMTP_ENDPOINT;
  if (!endpoint) {
    return new Response('SMTP endpoint not configured', { status: 500 });
  }

  return fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ host, port, user, pass, to, replyTo, subject, text: textBody, html: htmlBody }),
  });
}

function buildRawEmailMessage(to: string, subject: string, text: string, html: string, replyTo: string): string {
  return JSON.stringify({ to, subject, text, html, replyTo });
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export async function POST(request: Request): Promise<NextResponse> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid JSON' }, { status: 400 });
  }

  const parsed = contactRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: 'Invalid contact data', details: parsed.error.format() }, { status: 400 });
  }

  try {
    await sendAdminNotificationEmail(parsed.data);
  } catch (err) {
    console.error('Failed to send contact notification:', err);
    return NextResponse.json({ success: false, error: 'Failed to send message. Please try again later.' }, { status: 500 });
  }

  return NextResponse.json({ success: true, message: 'Message sent' }, { status: 200 });
}
