# Research Notes: Corporate Account Campaign Management

## Existing System Findings

### Architecture & Project Layout

- **Monorepo**: NestJS API (`apps/api`), Next.js frontend (`apps/web`), shared domain package (`packages/domain`), and Prisma models/migrations (`packages/prisma`).
- **Clean Architecture**: Application use cases depend only on `packages/domain` entities and ports. Controllers are thin. Infrastructure repositories live in `apps/api/src/infrastructure/prisma/repositories/` and implement domain ports.
- **Auth**: JWT guards (`JwtAuthGuard`) plus role-based guard (`RolesGuard`) enforce `UserRole.COMPANY` on corporate endpoints.
- **Validation**: Zod schemas in `apps/api/src/lib/schemas/corporate.schema.ts` validate request bodies and query parameters.

### Already-Implemented Backend Components

- **Controllers** (`apps/api/src/modules/corporate/`):
  - `campaigns.controller.ts`: POST/GET/PATCH for campaigns and status changes.
  - `access-codes.controller.ts`: POST/GET for access codes and POST to send by email.
  - `quizzes.controller.ts`: POST custom/personal quizzes and list company quizzes.
  - `results.controller.ts`: GET campaign results and result detail.
- **Use cases** (`apps/api/src/application/corporate/`):
  - `create-campaign.use-case.ts`, `list-campaigns.use-case.ts`, `get-campaign.use-case.ts`, `update-campaign-status.use-case.ts`
  - `create-access-code.use-case.ts`, `list-access-codes.use-case.ts`, `send-access-code.use-case.ts`
  - `create-custom-quiz.use-case.ts`, `create-personal-quiz.use-case.ts`, `list-company-quizzes.use-case.ts`
  - `list-campaign-results.use-case.ts`, `get-candidate-result-detail.use-case.ts`

### Database Schema (Prisma)

- `Campaign` already has `companyId`, `name`, `description`, `notes`, `status`, `createdByUserId`, `startDate`, `endDate`, timestamps, and indexes on `companyId` and `[companyId, status]`.
- `CampaignHistory` already has `action`, `status`, `changedByUserId`, `metadata` (JSON string), timestamps, and index on `campaignId`.
- `AccessCode` already has `campaignId`, `quizId`, `technologyId`, `status`, `sentAt`, `sentToEmail`, `usedCount`, `maxUses`, timestamps, and indexes.
- `CompanyQuiz` already supports `type` (`custom`/`personal`), `companyId`, `name`, `description`, `status`, `createdByUserId`.
- `CustomQuizQuestion` junction table and `CompanyQuizQuestion`/`CompanyQuizAnswer` tables exist for personal quizzes.
- `CandidateResult` already has a denormalized `campaignId` and indexes for campaign-scoped reads.
- `CompanyProfile` tracks `availableAccessCodes` and `availableTests`.
- Legacy tables (`Users`, `Companies`, `Students`, `Results`, `Candidates`, `Candidates_results`) are read-only and must not be written by feature code.

### Existing Frontend Routes

- `apps/web/src/app/campaigns/page.tsx` — campaign list
- `apps/web/src/app/campaigns/new/page.tsx` — create campaign
- `apps/web/src/app/campaigns/[id]/page.tsx` — campaign detail
- `apps/web/src/app/campaigns/[id]/results/page.tsx` — campaign results
- `apps/web/src/app/campaigns/[id]/results/[resultId]/page.tsx` — result detail
- `apps/web/src/app/quizzes/custom/page.tsx` — custom quiz builder
- `apps/web/src/app/quizzes/personal/page.tsx` — personal quiz builder

### Infrastructure Already in Place

- `IEmailService` with Nodemailer and Console adapters.
- Prisma repositories for `Campaign`, `AccessCode`, `CompanyQuiz`, `CompanyProfile`, `SessionResult`, etc.
- Session engine (`start-session.use-case.ts`) creates quiz sessions from access codes and resolves questions by `technologyId`.

## Gaps to Address

1. **Campaign status transitions do not disable access codes.**
   - `UpdateCampaignStatusUseCase` updates status and writes history but does not touch related `AccessCode` rows.
   - Requirement: closing disables unsent codes; archiving disables all codes; reopening does not reactivate disabled codes.

2. **Send access code does not create a campaign history entry.**
   - `SendAccessCodeUseCase` emails the code and records `sentAt`/`sentToEmail`, but writes nothing to `CampaignHistory`.
   - Requirement: send action is logged with recipient email and timestamp.

3. **Company access code limit semantics are not fully aligned.**
   - `CreateAccessCodeUseCase` checks `availableAccessCodes` and decrements it on creation, but uses the count as "remaining" rather than a hard cap on total created codes.
   - Requirement: limit counts total created codes regardless of sent/used status; UI must show created vs remaining clearly.

4. **Result detail does not support partially correct answers or charts.**
   - `GetCandidateResultDetailUseCase` returns per-question `isCorrect` booleans only.
   - Requirement: multiple-correct questions can be "partially correct" (half credit) and the response must include a chart summary with distinct segments for correct, incorrect, partially correct.

5. **Frontend pages exist but may not wire all clarified behaviors.**
   - Need to verify UI handles status transitions, access-code grid states (sent/used/inactive), company access-code limit display, and result chart.

6. **Test engine only resolves questions by `technologyId`.**
   - Access codes can reference `CompanyQuiz` quizzes (`quizType: 'company_quiz'`). The session engine must be able to start a test from a company quiz and resolve its question set.

## Reuse Strategy

- Keep existing controllers, use cases, repositories, and Prisma models.
- Extend behavior inside existing use cases (status transitions, send history, limit handling) and add new use cases only if necessary.
- Reuse `IEmailService` for sending codes.
- Reuse `CampaignHistory` for all audit entries; standardize `action` values (`created`, `status_changed`, `access_code_created`, `access_code_sent`).
- Reuse `CandidateResult` and session repositories; add campaign-scoped query methods where needed.
- Reuse domain entities/enums from `packages/domain`; no new ORM-specific code in Application layer.

## Decisions

- **Decision**: Extend the existing corporate module rather than create a new one.
  - **Rationale**: The feature is a refinement/clarification of the existing 013 corporate campaigns implementation, and the same package structure already covers campaigns, access codes, quizzes, and results.
- **Decision**: Use additive Prisma migrations for any schema tweaks.
  - **Rationale**: Constitution mandates legacy database care; current schema already supports most requirements, so few or no migrations may be needed beyond possibly adding a `createdAction` history index or nullable fields.
- **Decision**: Implement partial-correctness scoring in the result detail use case by comparing selected answers against correct answers for each question.
  - **Rationale**: Fits current architecture without changing the session engine; the result detail is the consumer of scoring logic.
- **Decision**: Handle company-quiz test starts by extending `StartSessionUseCase` to load questions from `CompanyQuiz` + junctions when `quizType === 'company_quiz'`.
  - **Rationale**: Centralizes access-code-to-test logic in one use case and avoids duplicating session creation.

## Risks

- `AccessCode.code` is globally unique; generating short 8-character codes may collide under scale, but existing retry/ConflictError is acceptable for corporate loads.
- `CampaignHistory.metadata` stores JSON strings; changes to metadata shape must remain backward-compatible for existing rows.
- Legacy `evaluateme` database must not be affected by any migration; all changes stay in v3 Prisma-managed tables.
- Partial-correctness scoring needs access to the full answer set for a question, requiring repository support to load answers by question/company-quiz-question IDs.
