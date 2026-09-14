import { EmailTemplate, QuestionSet } from '@evaluateme/domain';

const TEST_INVITATION_TEMPLATE_NAME = 'test_invitation';

interface RenderAccessCodeEmailInput {
  template: EmailTemplate;
  questionSet: QuestionSet | null;
  accessCode: { code: string; testeeName: string | null; testeeEmail: string | null };
  frontendOrigin: string;
}

export interface RenderedAccessCodeEmail {
  subject: string;
  html: string;
}

export function renderAccessCodeEmail(input: RenderAccessCodeEmailInput): RenderedAccessCodeEmail {
  const { template, questionSet, accessCode, frontendOrigin } = input;
  const recipientEmail = accessCode.testeeEmail ?? '';
  const candidateName = accessCode.testeeName ?? recipientEmail;
  const testName = questionSet?.title ?? 'the assessment';
  const testLink = `${frontendOrigin}/tests/start?accessCode=${encodeURIComponent(accessCode.code)}`;

    const subject = applyTemplate(template.subject, {
    candidateName,
    testName,
    testLink,
    accessCode: accessCode.code,
  });
  const html = applyTemplate(template.bodyHtml, {
    candidateName,
    testName,
    testLink,
    accessCode: accessCode.code,
  }).replace(/\n/g, '<br>');

  return { subject, html };
}

export function getTestInvitationTemplateName(): string {
  return TEST_INVITATION_TEMPLATE_NAME;
}

function applyTemplate(
  template: string,
  values: { candidateName: string; testName: string; testLink: string; accessCode: string },
): string {
  return template
    .replace(/{{candidateName}}/g, values.candidateName)
    .replace(/{{testName}}/g, values.testName)
    .replace(/{{testLink}}/g, values.testLink)
    .replace(/{{accessCode}}/g, values.accessCode);
}
