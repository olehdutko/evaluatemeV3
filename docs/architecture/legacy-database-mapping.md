# Legacy Database Mapping

This document describes how the existing MySQL `evaluateme` database maps to the v3 data model.

## Principle

- **Legacy tables are read-only.** They are preserved exactly as-is.
- **New v3 InnoDB tables** are created alongside legacy tables.
- **Data is copied idempotently** from legacy to v3 tables using natural keys.
- **Destructive changes** require explicit `--force-destructive` flag and documented approval.

## Legacy → v3 Table Mapping

| Legacy Table | Engine | v3 Treatment | v3 Destination | Read-Only Model |
|-------------|--------|-------------|----------------|-----------------|
| `Users` | ? | Keep + migrate | `User` | `LegacyUser` |
| `Companies` | MyISAM | Keep + migrate | `User` + `CompanyProfile` | `LegacyCompany` |
| `Students` | MyISAM | Keep + migrate | `UserSession` | `LegacyStudent` |
| `Results` | MyISAM | Keep + migrate | `UserResult` | `LegacyResult` |
| `Candidates` | MyISAM | Keep + migrate | `CandidateSession` | `LegacyCandidate` |
| `Candidates_results` | MyISAM | Keep + migrate | `CandidateResult` | `LegacyCandidateResult` |
| `StudentQuestions` | MyISAM | Keep archive | — | — |
| `Questions` | MyISAM | Keep archive → map | `Question` | — |
| `Technologies` | MyISAM | Keep archive → map | `Technology` | — |
| `TestQuestions` | MyISAM | Keep archive → map | `Test` ↔ `Question` | — |
| `EmailTemplate` | MyISAM | Keep archive → map | `EmailTemplate` | — |
| `LandingAd` | MyISAM | Keep archive → map | `LandingAd` | — |
| `Orders` | MyISAM | Keep archive → map | `Order` | — |
| `AccessCodes` | MyISAM | Keep archive → map | `AccessCode` | — |
| `Payment` | MyISAM | Keep archive → map | `Order` | — |
| `Students_Results` | MyISAM | Keep archive → map | `UserSession` ↔ `UserResult` | — |
| `Candidates_Results` | MyISAM | Keep archive → map | `CandidateSession` ↔ `CandidateResult` | — |
| `StudentAnswers` | MyISAM | Keep archive → map | `UserSession.answerId` | — |
| `CandidateAnswers` | MyISAM | Keep archive → map | `CandidateSession.answerId` | — |

## Prisma Read-Only Legacy Models

Defined in `packages/prisma/schema.prisma`:

- `LegacyUser` → `@@map("Users")`
- `LegacyCompany` → `@@map("Companies")`
- `LegacyStudent` → `@@map("Students")`
- `LegacyResult` → `@@map("Results")`
- `LegacyCandidate` → `@@map("Candidates")`
- `LegacyCandidateResult` → `@@map("Candidates_results")`

These models are intentionally read-only. Feature code MUST NOT write to them.

## Migration Rules

1. **Users**: Add v3 columns (`role`, `activation_status`, `password_hash`, `company_profile_id`). Map legacy `role` to `role` and legacy `status` to `activation_status` (`1`→`active`, `0`→`pending`). Preserve original columns.
2. **Companies**: For each legacy company row:
   - If no `User` exists with the same email, create a `User` with `role = 'company'`.
   - If a `User` exists, link the new `CompanyProfile` to that `User`.
   - If a `CompanyProfile` already exists for the linked `User`, skip creation.
3. **Sessions/Results**: One-time idempotent copy using natural keys. Do not modify or delete original legacy rows.

## Safety

All migration code uses `MigrationGuard` in `apps/api/src/infrastructure/migrations/migration-guard.ts`, which blocks destructive SQL unless `--force-destructive` is passed.

## References

- `docs/architecture/adr-002-legacy-database-strategy.md`
- `packages/prisma/migrations/`
- `apps/api/src/infrastructure/migrations/`
