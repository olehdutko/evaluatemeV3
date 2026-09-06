# Research Notes: Corporate Campaigns Management

## Existing System Findings

- **Company account model**: `User` has optional `companyProfileId` → `CompanyProfile` (one-to-one). `CompanyProfile` already tracks `availableTests` and `availableAccessCodes`.
- **Campaign tables**: `Campaign` and `CampaignHistory` already exist in Prisma schema. Current fields:
  - `Campaign`: id, name, description, status, createdByUserId, startDate, endDate, createdAt, updatedAt.
  - `CampaignHistory`: id, campaignId, status, changedByUserId, changedAt, createdAt, updatedAt.
- **Access codes**: `AccessCode` already exists with code, companyId, technologyId, status, expiresAt, usedAt. It currently has **no campaignId**, so a migration must add it.
- **Candidate results**: `CandidateResult` and `CandidateSession` exist but have no campaign linkage; `accessCodeId` exists on `CandidateSession` and can be used to resolve a campaign.
- **Quizzes**: No company-private quiz abstraction yet. Only `Technology` + `Question` + `Answer` (global admin-managed content).
- **Email**: `IEmailService` port already implemented via Nodemailer/Console adapters.
- **Auth/roles**: JWT guards and role decorators exist. We will require company-admin role on corporate routes.

## Gaps to Address

1. `Campaign` needs `companyId` and `notes` fields.
2. `CampaignHistory` should also record `action` (created, status_changed) and optionally `access_code_created`.
3. `AccessCode` needs `campaignId` and `sentAt`/`sentToEmail` fields.
4. New `CompanyQuiz` table for custom/personal quizzes with `companyId`, `type`, `name`, and a junction table for selected questions.
5. New `CompanyQuizQuestion`/`CompanyQuizAnswer` tables (or reuse `Question`/`Answer` with a `companyQuizId`) for personal quiz content.
6. Candidate result must be campaign-scoped, ideally via a denormalized `campaignId` on `CandidateResult` or resolved through `accessCodeId`.

## Reuse Strategy

- Reuse `CompanyProfile` for limits and ownership.
- Reuse `Campaign` / `CampaignHistory` tables; add missing columns via Prisma migration.
- Reuse `AccessCode` table; add `campaignId` and sent-tracking columns.
- Reuse existing `IEmailService` for sending codes.
- Reuse `CandidateResult` / `CandidateSession` engine but ensure `campaignId` is captured at result creation time.
- Reuse `Question` and `Answer` for custom quiz selection; create company-specific tables only for personal/original questions.

## Risks

- Legacy `Campaign` table may contain old production rows. Migrations must be additive/nullable.
- `AccessCode.code` is unique; campaign-specific codes continue to be globally unique.
- Candidate result creation currently happens inside test-engine use cases; adding `campaignId` requires propagating it from access code or session.
