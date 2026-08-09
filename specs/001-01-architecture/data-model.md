# Data Model: Architecture Foundation

## Overview

This document defines the v3 domain entities, their attributes, relationships, validation rules, and the mapping from the legacy MySQL `evaluateme` database. The architecture foundation does not drop or destructively alter legacy tables; it creates new v3 InnoDB tables alongside them and copies data idempotently.

## v3 Domain Entities

### User

The unified account entity for personal users, companies, and admins.

| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| `id` | UUID / string | PK, unique | v3 surrogate key |
| `email` | string | Unique, not null | Global email uniqueness preserved from legacy |
| `passwordHash` | string | Nullable | bcrypt hash; null until MD5→bcrypt rehash on login |
| `legacyMd5Hash` | string | Nullable | Kept temporarily until rehashed; invalidated after |
| `role` | enum | `user`, `company`, `admin` | Populated during migration from legacy `Users.role`; no separate `v3_role` column exists |
| `activationStatus` | enum | `active`, `pending`, `suspended` | `1`→`active`, `0`→`pending` from legacy `status` |
| `companyProfileId` | UUID / string | Nullable, FK → `CompanyProfile.id` | Only when role = `company` |
| `createdAt` | datetime | Not null | From legacy or v3 default |
| `updatedAt` | datetime | Not null | Auto-updated |

**State transitions**: `pending` → `active` (via activation), `active` → `suspended` (via admin action).

**Uniqueness**: `email` is globally unique.

### CompanyProfile

Child table for company-specific data, linked to a `User` with role `company`.

| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| `id` | UUID / string | PK | v3 surrogate key |
| `userId` | UUID / string | Not null, FK → `User.id`, unique | 1:1 with company user |
| `companyName` | string | Not null | From legacy `Companies.company_name` |
| `address` | string | Nullable | |
| `phone` | string | Nullable | |
| `country` | string | Nullable | |
| `occupation` | string | Nullable | |
| `availableTests` | integer | Default 0 | Credit economy |
| `availableAccessCodes` | integer | Default 0 | Credit economy |
| `createdAt` | datetime | Not null | |
| `updatedAt` | datetime | Not null | |

**Migration rule**: Skip if a profile already exists for the linked user; create only missing profiles.

### Campaign

| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| `id` | UUID / string | PK | |
| `name` | string | Not null | |
| `description` | text | Nullable | |
| `status` | enum | `draft`, `active`, `paused`, `closed` | |
| `createdByUserId` | UUID / string | FK → `User.id` | Admin/company owner |
| `startDate` | datetime | Nullable | |
| `endDate` | datetime | Nullable | |
| `createdAt` | datetime | Not null | |
| `updatedAt` | datetime | Not null | |

### CampaignHistory

Audit log of campaign status changes.

| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| `id` | UUID / string | PK | |
| `campaignId` | UUID / string | FK → `Campaign.id` | |
| `status` | enum | `draft`, `active`, `paused`, `closed` | New status |
| `changedByUserId` | UUID / string | FK → `User.id` | |
| `changedAt` | datetime | Not null | |

### Technology

Catalog of technologies for tests.

| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| `id` | UUID / string | PK | Mapped from legacy `Technologies` |
| `name` | string | Unique, not null | |
| `slug` | string | Unique, not null | URL-safe identifier |
| `description` | text | Nullable | |
| `createdAt` | datetime | Not null | |

### Test

| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| `id` | UUID / string | PK | |
| `title` | string | Not null | |
| `technologyId` | UUID / string | FK → `Technology.id` | |
| `status` | enum | `draft`, `published`, `archived` | |
| `durationMinutes` | integer | Nullable | Time limit |
| `passingScore` | integer | Nullable | Minimum score to pass |
| `createdByUserId` | UUID / string | FK → `User.id` | |
| `createdAt` | datetime | Not null | |
| `updatedAt` | datetime | Not null | |

### Question

| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| `id` | UUID / string | PK | |
| `testId` | UUID / string | FK → `Test.id` | |
| `content` | text | Not null | Question text |
| `type` | enum | `single_choice`, `multiple_choice`, `text` | |
| `orderIndex` | integer | Not null | Display order |
| `score` | integer | Default 1 | Points for correct answer |
| `createdAt` | datetime | Not null | |
| `updatedAt` | datetime | Not null | |

### Answer

| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| `id` | UUID / string | PK | |
| `questionId` | UUID / string | FK → `Question.id` | |
| `content` | text | Not null | Answer text |
| `isCorrect` | boolean | Not null | |
| `orderIndex` | integer | Not null | |

### FreeSampleQuestion

Promotional free questions shown without authentication.

| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| `id` | UUID / string | PK | |
| `technologyId` | UUID / string | FK → `Technology.id` | |
| `content` | text | Not null | |
| `type` | enum | `single_choice`, `multiple_choice`, `text` | |
| `explanation` | text | Nullable | |
| `createdAt` | datetime | Not null | |

### UserSession

Tracks a user's progress through a test.

| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| `id` | UUID / string | PK | |
| `sessionId` | string | Not null, part of UK | Natural key from legacy `Students.session_id` |
| `questionId` | UUID / string | Not null, part of UK | |
| `userId` | UUID / string | FK → `User.id` | |
| `testId` | UUID / string | FK → `Test.id` | |
| `answerId` | UUID / string | Nullable, FK → `Answer.id` | User's chosen answer |
| `status` | enum | `pending`, `in_progress`, `completed`, `abandoned`, `archived` | |
| `startedAt` | datetime | Nullable | |
| `completedAt` | datetime | Nullable | |
| `createdAt` | datetime | Not null | |

**Idempotency key**: `sessionId` + `questionId`.

### UserResult

Final result of a user's test session.

| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| `id` | UUID / string | PK | |
| `resultCode` | string | Unique, not null | Natural key from legacy `Results.result_code` |
| `userId` | UUID / string | FK → `User.id` | |
| `testId` | UUID / string | FK → `Test.id` | |
| `score` | integer | Nullable | |
| `maxScore` | integer | Nullable | |
| `status` | enum | `pending`, `in_progress`, `completed`, `abandoned`, `archived` | |
| `sessionId` | string | Nullable | Links to `UserSession.sessionId` |
| `createdAt` | datetime | Not null | |
| `updatedAt` | datetime | Not null | |

### CandidateSession

Same structure as `UserSession`, but for candidates (test-takers who are not registered users).

| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| `id` | UUID / string | PK | |
| `sessionId` | string | Not null, part of UK | From legacy `Candidates.session_id` |
| `questionId` | UUID / string | Not null, part of UK | |
| `candidateId` | UUID / string | Nullable | May link to a registered user later |
| `accessCodeId` | UUID / string | FK → `AccessCode.id` | |
| `answerId` | UUID / string | Nullable, FK → `Answer.id` | |
| `status` | enum | `pending`, `in_progress`, `completed`, `abandoned`, `archived` | |
| `startedAt` | datetime | Nullable | |
| `completedAt` | datetime | Nullable | |
| `createdAt` | datetime | Not null | |

### CandidateResult

Same structure as `UserResult`, for candidates.

| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| `id` | UUID / string | PK | |
| `resultCode` | string | Unique, not null | From legacy `Candidates_results.result_code` |
| `candidateId` | UUID / string | Nullable | |
| `testId` | UUID / string | FK → `Test.id` | |
| `score` | integer | Nullable | |
| `maxScore` | integer | Nullable | |
| `status` | enum | `pending`, `in_progress`, `completed`, `abandoned`, `archived` | |
| `sessionId` | string | Nullable | |
| `createdAt` | datetime | Not null | |
| `updatedAt` | datetime | Not null | |

### AccessCode

| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| `id` | UUID / string | PK | |
| `code` | string | Unique, not null | Alphanumeric access code |
| `companyId` | UUID / string | FK → `User.id` | Purchasing company |
| `testId` | UUID / string | FK → `Test.id` | |
| `status` | enum | `active`, `used`, `expired`, `revoked` | |
| `expiresAt` | datetime | Nullable | |
| `usedAt` | datetime | Nullable | |
| `createdAt` | datetime | Not null | |

### Order

| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| `id` | UUID / string | PK | |
| `orderNumber` | string | Unique, not null | Business identifier |
| `userId` | UUID / string | FK → `User.id` | |
| `amount` | decimal | Not null | |
| `currency` | string | Not null, default `USD` | |
| `status` | enum | `pending`, `paid`, `failed`, `refunded` | |
| `createdAt` | datetime | Not null | |
| `updatedAt` | datetime | Not null | |

### EmailTemplate

| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| `id` | UUID / string | PK | |
| `name` | string | Unique, not null | Template key |
| `subject` | string | Not null | |
| `bodyHtml` | text | Not null | |
| `bodyText` | text | Nullable | |
| `variables` | json | Nullable | Allowed template variables |
| `createdAt` | datetime | Not null | |
| `updatedAt` | datetime | Not null | |

### LandingAd

| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| `id` | UUID / string | PK | |
| `title` | string | Not null | |
| `content` | text | Nullable | |
| `imageUrl` | string | Nullable | |
| `linkUrl` | string | Nullable | |
| `position` | enum | `home_top`, `home_bottom`, `sidebar` | |
| `isActive` | boolean | Default true | |
| `createdAt` | datetime | Not null | |
| `updatedAt` | datetime | Not null | |

### CreditSetting

Key-value table for admin-configurable credit economy.

| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| `id` | UUID / string | PK | |
| `key` | string | Unique, not null | `personal_credit_price`, `company_access_code_price`, etc. |
| `value` | string / json | Not null | Stored as string or JSON depending on type |
| `updatedByUserId` | UUID / string | FK → `User.id` | Admin who last changed it |
| `updatedAt` | datetime | Not null | |

## Legacy → v3 Table Mapping

| Legacy Table | Engine | v3 Treatment | v3 Destination | Notes |
|-------------|--------|-------------|----------------|-------|
| `Users` | ? | Keep + migrate | `User` | Add v3 columns: `role`, `activation_status`, `password_hash`, `company_profile_id` |
| `Companies` | MyISAM | Keep + migrate | `User` + `CompanyProfile` | Original rows preserved read-only |
| `Students` | MyISAM | Keep + migrate | `UserSession` | New InnoDB table; idempotent copy |
| `Results` | MyISAM | Keep + migrate | `UserResult` | New InnoDB table; idempotent copy |
| `Candidates` | MyISAM | Keep + migrate | `CandidateSession` | New InnoDB table; idempotent copy |
| `Candidates_results` | MyISAM | Keep + migrate | `CandidateResult` | New InnoDB table; idempotent copy |
| `StudentQuestions` | MyISAM | Keep archive | — | Read-only reference |
| `Questions` | MyISAM | Keep archive → map | `Question` | Read-only reference; map to v3 questions |
| `Technologies` | MyISAM | Keep archive → map | `Technology` | Read-only reference |
| `TestQuestions` | MyISAM | Keep archive → map | `Test` ↔ `Question` relationship | Read-only reference |
| `EmailTemplate` | MyISAM | Keep archive → map | `EmailTemplate` | Read-only reference |
| `LandingAd` | MyISAM | Keep archive → map | `LandingAd` | Read-only reference |
| `Orders` | MyISAM | Keep archive → map | `Order` | Read-only reference |
| `AccessCodes` | MyISAM | Keep archive → map | `AccessCode` | Read-only reference |
| `Payment` | MyISAM | Keep archive → map | `Order` | Read-only reference |
| `Students_Results` | MyISAM | Keep archive → map | `UserSession` ↔ `UserResult` | Read-only reference |
| `Candidates_Results` | MyISAM | Keep archive → map | `CandidateSession` ↔ `CandidateResult` | Read-only reference |
| `StudentAnswers` | MyISAM | Keep archive → map | `UserSession.answerId` | Read-only reference |
| `CandidateAnswers` | MyISAM | Keep archive → map | `CandidateSession.answerId` | Read-only reference |

## Relationships

```text
User 1--1 CompanyProfile (optional, when role=company)
User 1--* Campaign (createdByUserId)
User 1--* UserSession
User 1--* UserResult
User 1--* Order

Technology 1--* Test
Technology 1--* FreeSampleQuestion
Test 1--* Question
Question 1--* Answer

Test 1--* UserSession
Test 1--* UserResult
Test 1--* CandidateResult

UserSession *--1 User
UserResult *--1 User
CandidateSession *--? User (candidateId)
CandidateResult *--? User (candidateId)

AccessCode *--1 User (companyId)
AccessCode *--1 Test
CampaignHistory *--1 Campaign
CampaignHistory *--1 User (changedByUserId)

EmailTemplate 1--1 User (updatedByUserId)
LandingAd — no required FKs
CreditSetting 1--1 User (updatedByUserId)
```

## Validation Rules

- `User.email` must be a valid email and globally unique.
- `User.role` must be one of `user`, `company`, `admin`.
- `CompanyProfile.userId` must reference a `User` with `role = 'company'`.
- `Question.type` must match allowed answer structures (e.g., `single_choice` requires exactly one correct answer).
- `AccessCode.code` must be unique and match a defined format.
- `Campaign.startDate` must be before or equal to `Campaign.endDate` when both are provided.

## State Machines

### User.activationStatus

```
pending --(activation)--> active
active --(admin suspend)--> suspended
suspended --(admin reactivate)--> active
```

### Session / Result status

```
pending --(start)--> in_progress
in_progress --(submit/finish)--> completed
in_progress --(timeout/abandon)--> abandoned
completed --(archive migration)--> archived
abandoned --(archive migration)--> archived
```

### AccessCode.status

```
active --(used)--> used
active --(expiration)--> expired
active --(admin)--> revoked
```

### Campaign.status

```
draft --(publish)--> active
active --(pause)--> paused
paused --(resume)--> active
active --(close)--> closed
paused --(close)--> closed
```

## Migration Rules

1. **Users**: Add v3 columns (`role`, `activation_status`, `password_hash`, `company_profile_id`). Map legacy `role` to `role` and legacy `status` to `activation_status` (`1`→`active`, `0`→pending`). Preserve original columns.
2. **Companies**: For each legacy company row:
   - If no `User` exists with the same email, create a `User` with `role = 'company'`.
   - If a `User` exists, link the new `CompanyProfile` to that `User`.
   - If a `CompanyProfile` already exists for the linked `User`, skip creation.
3. **Sessions/Results**: One-time idempotent copy using natural keys. Do not modify or delete original legacy rows.

## Notes

- Foreign keys from v3 tables to legacy MyISAM tables are avoided until legacy tables are converted to InnoDB.
- New v3 InnoDB tables may reference each other with foreign keys.
- Legacy archive tables are read-only references during the architecture foundation phase.
