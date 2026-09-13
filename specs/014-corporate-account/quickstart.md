# Quickstart: Corporate Account Campaign Management

This guide documents runnable validation scenarios for the corporate campaign management feature. It assumes a working local API and web app.

## Prerequisites

- Node.js 20+ and pnpm/npm/yarn installed
- MySQL server running with the v3 database
- Environment variables configured (`DATABASE_URL`, `JWT_SECRET`, email service config)
- API server running on `http://localhost:3001`
- Web app running on `http://localhost:3000`
- Test accounts (seeds may provide these automatically):
  - Corporate admin: `corporate.admin@example.com` / `CorpPassword123!`
  - Private user: `private.user@example.com` / `UserPassword123!`

## Scenario 1 — Create and Manage a Campaign

### Steps

1. Log in as a corporate admin.
2. POST `/api/v1/auth/login` with credentials to obtain the session cookie/JWT.
3. POST `/api/v1/corporate/campaigns`:
   ```json
   {
     "companyId": "<company-uuid>",
     "name": "Frontend Hiring Q3",
     "description": "React + TypeScript assessment",
     "notes": "Focus on hooks and generics"
   }
   ```
4. Verify response contains `id`, `status: "open"`, `createdByUserId`, `companyId`, and `createdAt`.
5. GET `/api/v1/corporate/campaigns?companyId=<company-uuid>&status=open` and confirm the new campaign appears.
6. GET `/api/v1/corporate/campaigns/<campaign-id>?companyId=<company-uuid>` and confirm `history` has one entry with `action: "created"`.

### Expected outcome

Campaign is created with status `open` and an audit history entry.

## Scenario 2 — Status Transitions Disable Access Codes

### Setup

Create an open campaign and add at least one unsent access code (see Scenario 3).

### Steps

1. PATCH `/api/v1/corporate/campaigns/<campaign-id>/status` with `{ "companyId": "...", "status": "closed" }`.
2. GET `/api/v1/corporate/campaigns/<campaign-id>/access-codes?companyId=...`.
3. Confirm unsent codes now have `status: "revoked"`; sent codes remain unchanged.
4. PATCH status to `archived`.
5. Confirm all codes now have `status: "revoked"`.
6. PATCH status back to `open`.
7. Confirm previously revoked codes stay `revoked` (no automatic reactivation).

### Expected outcome

Status-driven disabling rules from the spec are enforced and recorded in `CampaignHistory` with `action: "status_changed"`.

## Scenario 3 — Create and Send an Access Code

### Setup

Have an open campaign and at least one available quiz (a technology or a company quiz).

### Steps

1. POST `/api/v1/corporate/campaigns/<campaign-id>/access-codes`:
   ```json
   {
     "companyId": "<company-uuid>",
     "quizId": "<quiz-uuid>",
     "quizType": "technology",
     "technologyId": "<technology-uuid>"
   }
   ```
2. Verify response contains `id` and `code`.
3. POST `/api/v1/corporate/access-codes/<access-code-id>/send`:
   ```json
   {
     "companyId": "<company-uuid>",
     "email": "candidate@example.com"
   }
   ```
4. Verify `sentAt` is returned and the email adapter logs/sends the message.
5. GET campaign detail and confirm a history entry with `action: "access_code_sent"` and metadata containing `recipientEmail`.
6. Attempt to create an access code in a closed/archived campaign and confirm a clear `400` error.

### Expected outcome

Access code is created only in open campaigns; sending updates `sentAt`/`sentToEmail` and logs a history entry.

## Scenario 4 — Company Access Code Limit

### Setup

Configure `CompanyProfile.availableAccessCodes` to a small number (e.g., 3).

### Steps

1. Create three access codes in an open campaign.
2. Attempt to create a fourth access code.
3. Confirm the request returns `400` with a clear message about the limit.
4. GET the campaign detail/dashboard and confirm the display shows "3 of 3 created" or "0 remaining".

### Expected outcome

The limit counts total created codes and creation is blocked once exhausted.

## Scenario 5 — Create Private Custom and Personal Quizzes

### Custom quiz

1. POST `/api/v1/corporate/quizzes/custom`:
   ```json
   {
     "companyId": "<company-uuid>",
     "name": "React Custom Quiz",
     "description": "Selected questions",
     "questionIds": ["q1-uuid", "q2-uuid"]
   }
   ```
2. Verify response contains `id` and `name`.

### Personal quiz

1. POST `/api/v1/corporate/quizzes/personal`:
   ```json
   {
     "companyId": "<company-uuid>",
     "name": "Tailored Algorithms Quiz",
     "questions": [
       {
         "content": "What is O(n log n)?",
         "type": "single_choice",
         "answers": [
           { "content": "Linearithmic time", "isCorrect": true },
           { "content": "Quadratic time", "isCorrect": false }
         ]
       }
     ]
   }
   ```
2. Verify response contains `id` and `name`.

### Cross-company isolation

1. Log in as an administrator of a different company.
2. GET `/api/v1/corporate/quizzes?companyId=<other-company-uuid>`.
3. Confirm quizzes created by the first company are not listed.

### Expected outcome

Both quiz types are created and isolated to the owning company.

## Scenario 6 — Candidate Result with Partial Correctness

### Setup

Create an access code for a multiple-choice question with more than one correct answer, send it to a candidate, and complete the test.

### Steps

1. Start the test with the access code via the public test-engine endpoint.
2. Submit answers so that one question is fully correct, one partially correct (some but not all correct answers selected, no incorrect answers), and one incorrect.
3. Complete the test.
4. GET `/api/v1/corporate/campaigns/<campaign-id>/results` and confirm the result appears.
5. GET `/api/v1/corporate/campaigns/<campaign-id>/results/<result-id>?companyId=...`.
6. Verify `questions[].correctness` includes `partially_correct` for the partially answered question and `chart` shows three distinct segments.
7. Verify `score` reflects half credit for the partially correct question.

### Expected outcome

Detailed result shows correct, incorrect, and partially correct labels plus a summary chart.

## Scenario 7 — Historical Results Remain Visible After Reopen

### Setup

A campaign with a completed candidate result.

### Steps

1. Close the campaign.
2. Confirm the result is still listed in `/api/v1/corporate/campaigns/<campaign-id>/results`.
3. Archive the campaign.
4. Confirm the result is still listed.
5. Reopen the campaign.
6. Confirm the result is still listed.

### Expected outcome

Candidate results remain visible regardless of campaign status changes.

## Troubleshooting

- If access code creation fails with a limit error, check `CompanyProfile.availableAccessCodes`.
- If a sent access code is still revoked, verify the campaign was not closed/archived before sending.
- If partial correctness is missing, ensure the question is `multiple_choice` with multiple correct answers and the result detail use case was updated.
