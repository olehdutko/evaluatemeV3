# Legacy Database Mapping

This document describes how the legacy EvaluateMe v2 MySQL database is treated in EvaluateMe v3 architecture.

## Guiding Principles

- **Never drop or modify existing legacy data**: all original tables and rows remain intact.
- **Legacy tables are read-only references** during the foundation phase.
- **New v3 tables are InnoDB**, live alongside the legacy MyISAM tables, and use Prisma-managed migrations.
- **Migration is idempotent**: re-running a migration does not create duplicates.

## Legacy → v3 Table Map

| Legacy Table | Engine | v3 Treatment | v3 Destination | Notes |
|-------------|--------|-------------|----------------|-------|
| `Users` | ? | Keep + migrate | `User` | Add `role`, `activation_status`, `password_hash`, `company_profile_id`; original rows preserved |
| `Companies` | MyISAM | Keep + migrate | `User` + `CompanyProfile` | Original rows preserved; v3 splits company-specific data into `CompanyProfile` linked to `User` |
| `Students` | MyISAM | Keep + migrate | `UserSession` | Natural-key copy by `session_id` + `question_id` |
| `Results` | MyISAM | Keep + migrate | `UserResult` | Natural-key copy by `result_code` |
| `Candidates` | MyISAM | Keep + migrate | `CandidateSession` | Natural-key copy by `session_id` + `question_id` |
| `Candidates_results` | MyISAM | Keep + migrate | `CandidateResult` | Natural-key copy by `result_code` |
| `StudentQuestions` | MyISAM | Keep archive | — | Read-only reference for historical question links |
| `Questions` | MyISAM | Keep archive → map | `Question` | Read-only reference; mapped to v3 questions when content is imported |
| `Technologies` | MyISAM | Keep archive → map | `Technology` | Read-only reference; reimported into v3 as needed |
| `TestQuestions` | MyISAM | Keep archive → map | `Test` ↔ `Question` relationship | Read-only reference |
| `EmailTemplate` | MyISAM | Keep archive → map | `EmailTemplate` | Read-only reference |
| `LandingAd` | MyISAM | Keep archive → map | `LandingAd` | Read-only reference |
| `Orders` | MyISAM | Keep archive → map | `Order` | Read-only reference |
| `Payment` | MyISAM | Keep archive → map | `Order` | Read-only reference |
| `AccessCodes` | MyISAM | Keep archive → map | `AccessCode` | Read-only reference |
| `Students_Results` | MyISAM | Keep archive → map | `UserSession` ↔ `UserResult` | Read-only reference; relation expressed by `UserResult.sessionId` in v3 |
| `Candidates_Results` | MyISAM | Keep archive → map | `CandidateSession` ↔ `CandidateResult` | Read-only reference; relation expressed by `CandidateResult.sessionId` in v3 |
| `StudentAnswers` | MyISAM | Keep archive → map | `UserSession.answerId` | Read-only reference |
| `CandidateAnswers` | MyISAM | Keep archive → map | `CandidateSession.answerId` | Read-only reference |

## Migration Rules

### Users Migration

1. Add v3 columns to existing `users` table: `role`, `activation_status`, `password_hash`, `company_profile_id`.
2. Map legacy `Users.role` to `User.role`.
3. Map legacy `Users.status` to `User.activation_status`: `1` → `active`, `0` → `pending`.
4. If `Users.password` is a 32-char hex MD5 hash, store it in `legacy_md5_hash`; otherwise bcrypt-hash it into `password_hash`.
5. Skip rows whose email already exists in v3 (idempotency).

### Companies Migration

1. For each legacy `Companies` row:
   - Find or create a `User` with the same email and role `company`.
   - If a `CompanyProfile` already exists for that user, skip.
   - Otherwise create a `CompanyProfile` with credits (`available_tests`, `available_access_codes`).
2. Original `Companies` rows are never modified.

### Sessions / Results Migration

1. Copy `Students` rows into `UserSession` using natural key `session_id` + `question_id`; skip if the natural key already exists.
2. Copy `Results` rows into `UserResult` using natural key `result_code`; skip if the code already exists.
3. Copy `Candidates` rows into `CandidateSession` using natural key `session_id` + `question_id`; skip if the natural key already exists.
4. Copy `Candidates_results` rows into `CandidateResult` using natural key `result_code`; skip if the code already exists.
5. No legacy rows are deleted.

## Ignored / Archived Tables

Legacy archive tables are kept unchanged and used only as historical references. They are not linked by foreign keys until they are converted to InnoDB.

## Natural Keys and Idempotency

| v3 Table | Natural Key / Unique Field |
|----------|---------------------------|
| `UserSession` | (`session_id`, `question_id`) |
| `UserResult` | `result_code` |
| `CandidateSession` | (`session_id`, `question_id`) |
| `CandidateResult` | `result_code` |
| `User` | `email` |
| `CompanyProfile` | `user_id` |

Re-running a migration checks the natural key before inserting, so duplicate rows are never created.
