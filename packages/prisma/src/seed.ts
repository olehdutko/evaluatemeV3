import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const ADMIN_EMAIL = 'admin@evaluateme.it';
const ADMIN_PASSWORD = 'admin123';

const emailTemplates = [
  {
    name: 'welcome_personal',
    subject: 'Welcome to EvaluateMe.IT, {{userName}}!',
    bodyHtml: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Welcome to EvaluateMe.IT</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
  <h2 style="color: #4f46e5;">Welcome, {{userName}}!</h2>
  <p>Thanks for creating a personal account on <strong>EvaluateMe.IT</strong>.</p>
  <p>Please verify your email address by clicking the button below:</p>
  <p>
    <a href="{{verificationLink}}" style="background: #4f46e5; color: white; padding: 12px 20px; text-decoration: none; border-radius: 6px; display: inline-block;">
      Verify Email
    </a>
  </p>
  <p>Or copy and paste this link into your browser:</p>
  <p><a href="{{verificationLink}}">{{verificationLink}}</a></p>
  <p>Best regards,<br>The EvaluateMe.IT Team</p>
</body>
</html>`,
    bodyText: `Welcome, {{userName}}!

Thanks for creating a personal account on EvaluateMe.IT.
Please verify your email address by opening the link below:

{{verificationLink}}

Best regards,
The EvaluateMe.IT Team`,
    variables: JSON.stringify({ userName: 'string', verificationLink: 'string' }),
  },
  {
    name: 'welcome_company',
    subject: 'Welcome to EvaluateMe.IT, {{companyName}}!',
    bodyHtml: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Welcome to EvaluateMe.IT</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
  <h2 style="color: #4f46e5;">Welcome, {{companyName}}!</h2>
  <p>Thanks for creating a corporate account on <strong>EvaluateMe.IT</strong>.</p>
  <p>Please verify your email address by clicking the button below:</p>
  <p>
    <a href="{{verificationLink}}" style="background: #4f46e5; color: white; padding: 12px 20px; text-decoration: none; border-radius: 6px; display: inline-block;">
      Verify Email
    </a>
  </p>
  <p>Or copy and paste this link into your browser:</p>
  <p><a href="{{verificationLink}}">{{verificationLink}}</a></p>
  <p>Best regards,<br>The EvaluateMe.IT Team</p>
</body>
</html>`,
    bodyText: `Welcome, {{companyName}}!

Thanks for creating a corporate account on EvaluateMe.IT.
Please verify your email address by opening the link below:

{{verificationLink}}

Best regards,
The EvaluateMe.IT Team`,
    variables: JSON.stringify({ companyName: 'string', verificationLink: 'string' }),
  },
  {
    name: 'password_reset',
    subject: 'Reset your EvaluateMe.IT password',
    bodyHtml: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Reset your password</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
  <h2 style="color: #4f46e5;">Password reset</h2>
  <p>Hello {{userName}},</p>
  <p>We received a request to reset your password. Click the button below to choose a new one:</p>
  <p>
    <a href="{{resetLink}}" style="background: #4f46e5; color: white; padding: 12px 20px; text-decoration: none; border-radius: 6px; display: inline-block;">
      Reset Password
    </a>
  </p>
  <p>Or copy and paste this link into your browser:</p>
  <p><a href="{{resetLink}}">{{resetLink}}</a></p>
  <p>If you did not request a password reset, you can safely ignore this email.</p>
  <p>Best regards,<br>The EvaluateMe.IT Team</p>
</body>
</html>`,
    bodyText: `Password reset

Hello {{userName}},

We received a request to reset your password. Open the link below to choose a new one:

{{resetLink}}

If you did not request a password reset, you can safely ignore this email.

Best regards,
The EvaluateMe.IT Team`,
    variables: JSON.stringify({ userName: 'string', resetLink: 'string' }),
  },
  {
    name: 'password_changed',
    subject: 'Your EvaluateMe.IT password was changed',
    bodyHtml: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Your password was changed</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
  <h2 style="color: #4f46e5;">Password changed</h2>
  <p>Hello {{userName}},</p>
  <p>Your EvaluateMe.IT password was just changed. If this was not you, please contact support immediately.</p>
  <p>Best regards,<br>The EvaluateMe.IT Team</p>
</body>
</html>`,
    bodyText: `Password changed

Hello {{userName}},

Your EvaluateMe.IT password was just changed. If this was not you, please contact support immediately.

Best regards,
The EvaluateMe.IT Team`,
    variables: JSON.stringify({ userName: 'string' }),
  },
  {
    name: 'invoice_payment_receipt',
    subject: 'Your EvaluateMe.IT invoice #{{orderNumber}}',
    bodyHtml: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Your invoice</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
  <h2 style="color: #4f46e5;">Thank you for your payment!</h2>
  <p>Hello {{userName}},</p>
  <p>We have received your payment for order <strong>#{{orderNumber}}</strong>.</p>
  <table style="border-collapse: collapse; margin: 20px 0;">
    <tr><td style="padding: 8px 12px; border: 1px solid #ddd;">Amount</td><td style="padding: 8px 12px; border: 1px solid #ddd;">{{amount}} {{currency}}</td></tr>
    <tr><td style="padding: 8px 12px; border: 1px solid #ddd;">Date</td><td style="padding: 8px 12px; border: 1px solid #ddd;">{{paymentDate}}</td></tr>
  </table>
  <p>Best regards,<br>The EvaluateMe.IT Team</p>
</body>
</html>`,
    bodyText: `Thank you for your payment!

Hello {{userName}},

We have received your payment for order #{{orderNumber}}.

Amount: {{amount}} {{currency}}
Date: {{paymentDate}}

Best regards,
The EvaluateMe.IT Team`,
    variables: JSON.stringify({
      userName: 'string',
      orderNumber: 'string',
      amount: 'string',
      currency: 'string',
      paymentDate: 'string',
    }),
  },
  {
    name: 'test_invitation',
    subject: 'You are invited to take {{testName}}',
    bodyHtml: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Test invitation</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
  <h2 style="color: #4f46e5;">You are invited</h2>
  <p>Hello {{candidateName}},</p>
  <p>You have been invited to take the test <strong>{{testName}}</strong>.</p>
  <p>Click the button below to start:</p>
  <p>
    <a href="{{testLink}}" style="background: #4f46e5; color: white; padding: 12px 20px; text-decoration: none; border-radius: 6px; display: inline-block;">
      Start Test
    </a>
  </p>
  <p>Or use this access code: <strong>{{accessCode}}</strong></p>
  <p>Best regards,<br>The EvaluateMe.IT Team</p>
</body>
</html>`,
    bodyText: `You are invited

Hello {{candidateName}},

You have been invited to take the test "{{testName}}".

Start here: {{testLink}}
Access code: {{accessCode}}

Best regards,
The EvaluateMe.IT Team`,
    variables: JSON.stringify({
      candidateName: 'string',
      testName: 'string',
      testLink: 'string',
      accessCode: 'string',
    }),
  },
  {
    name: 'test_results',
    subject: 'Your results for {{testName}}',
    bodyHtml: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Your test results</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
  <h2 style="color: #4f46e5;">Test results</h2>
  <p>Hello {{candidateName}},</p>
  <p>You have completed the test <strong>{{testName}}</strong>.</p>
  <p>Your score: <strong>{{score}} / {{maxScore}}</strong></p>
  <p>Status: <strong>{{status}}</strong></p>
  <p>Best regards,<br>The EvaluateMe.IT Team</p>
</body>
</html>`,
    bodyText: `Test results

Hello {{candidateName}},

You have completed the test "{{testName}}".

Your score: {{score}} / {{maxScore}}
Status: {{status}}

Best regards,
The EvaluateMe.IT Team`,
    variables: JSON.stringify({
      candidateName: 'string',
      testName: 'string',
      score: 'string',
      maxScore: 'string',
      status: 'string',
    }),
  },
  {
    name: 'quiz_result',
    subject: 'Your EvaluateMe.IT quiz result',
    bodyHtml: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Your quiz result</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
  <h2 style="color: #4f46e5;">Your quiz result is ready</h2>
  <p>Hello {{userName}},</p>
  <p>You have completed the <strong>{{technologyName}}</strong> quiz.</p>
  <p>Your score: <strong>{{score}} / {{maxScore}}</strong></p>
  <p>Your unique result code is:</p>
  <p style="font-family: monospace; font-size: 18px; background: #f3f4f6; padding: 12px; border-radius: 6px; display: inline-block;">{{resultCode}}</p>
  <p>You can view and share your result using this link:</p>
  <p><a href="{{resultLink}}" style="background: #4f46e5; color: white; padding: 12px 20px; text-decoration: none; border-radius: 6px; display: inline-block;">View result</a></p>
  <p>Or open: <a href="{{resultLink}}">{{resultLink}}</a></p>
  <p>Best regards,<br>The EvaluateMe.IT Team</p>
</body>
</html>`,
    bodyText: `Your quiz result is ready

Hello {{userName}},

You have completed the {{technologyName}} quiz.
Your score: {{score}} / {{maxScore}}

Your unique result code: {{resultCode}}

View and share your result: {{resultLink}}

Best regards,
The EvaluateMe.IT Team`,
    variables: JSON.stringify({ userName: 'string', technologyName: 'string', score: 'string', maxScore: 'string', resultCode: 'string', resultLink: 'string' }),
  },
];

async function seedAdmin(): Promise<void> {
  const existing = await prisma.user.findUnique({ where: { email: ADMIN_EMAIL } });
  if (existing) {
    // eslint-disable-next-line no-console
    console.log(`Admin user ${ADMIN_EMAIL} already exists.`);
    return;
  }

  // Hash password using the same algorithm as the API password hasher.
  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 10);
  await prisma.user.create({
    data: {
      id: crypto.randomUUID(),
      email: ADMIN_EMAIL,
      username: 'admin',
      passwordHash,
      role: 'admin',
      activationStatus: 'active',
      credits: 0,
    },
  });
  // eslint-disable-next-line no-console
  console.log(`Created admin user ${ADMIN_EMAIL}.`);
}

async function main(): Promise<void> {
  await seedAdmin();

  for (const template of emailTemplates) {
    await prisma.emailTemplate.upsert({
      where: { name: template.name },
      create: {
        id: crypto.randomUUID(),
        ...template,
      },
      update: {},
    });
  }
  // eslint-disable-next-line no-console
  console.log(`Seeded ${emailTemplates.length} email templates.`);
}

main()
  .catch((error) => {
    // eslint-disable-next-line no-console
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
