# Legacy Database Inventory

**Purpose**: Authoritative list of all tables in the existing MySQL `evaluateme` database and their treatment in the v3 architecture foundation.

**Source**: Existing production MySQL 5.7 instance at `192.168.1.132:3306`, database `evaluateme`.

**Scope**: This inventory is read-only for the architecture foundation. No table is dropped. New v3 InnoDB tables are created alongside legacy tables. Foreign keys are deferred until legacy MyISAM tables are converted to InnoDB in an explicitly approved future migration.

## Table Inventory

| # | Legacy Table | Engine | Treatment | v3 Mapping | Justification |
|---|-------------|--------|-----------|------------|---------------|
| 1 | `Users` | TBD | Keep + migrate | `User` entity | Unified account table; add v3 columns `role`, `activation_status`, `password_hash`, `company_profile_id`; preserve original columns and data |
| 2 | `Companies` | MyISAM | Keep + migrate | `User` (role = `company`) + `CompanyProfile` | Company-specific data moves to child table; original rows preserved read-only |
| 3 | `Students` | MyISAM | Keep + migrate | `UserSession` | New v3 InnoDB table; one-time idempotent copy using natural key `session_id` + `question_id` |
| 4 | `Results` | MyISAM | Keep + migrate | `UserResult` | New v3 InnoDB table; one-time idempotent copy using natural key `result_code` |
| 5 | `Candidates` | MyISAM | Keep + migrate | `CandidateSession` | New v3 InnoDB table; one-time idempotent copy using natural key `session_id` + `question_id` |
| 6 | `Candidates_results` | MyISAM | Keep + migrate | `CandidateResult` | New v3 InnoDB table; one-time idempotent copy using natural key `result_code` |
| 7 | `StudentQuestions` | MyISAM | Keep archive | Read-only reference | Maps student answers to questions; FK added after InnoDB conversion |
| 8 | `Questions` | MyISAM | Keep archive → map | `Question` entity | Question catalog reference; FK added after InnoDB conversion |
| 9 | `Technologies` | MyISAM | Keep archive → map | `Technology` entity | Technology catalog reference; FK added after InnoDB conversion |
| 10 | `TestQuestions` | MyISAM | Keep archive → map | `Test` ↔ `Question` relationship | Test-question association reference; FK added after InnoDB conversion |
| 11 | `EmailTemplate` | MyISAM | Keep archive → map | `EmailTemplate` entity | Admin email templates; FK added after InnoDB conversion |
| 12 | `LandingAd` | MyISAM | Keep archive → map | `LandingAd` entity | Landing page ads; FK added after InnoDB conversion |
| 13 | `Orders` | MyISAM | Keep archive → map | `Order` entity | Payment/order history; FK added after InnoDB conversion |
| 14 | `AccessCodes` | MyISAM | Keep archive → map | `AccessCode` entity | Access code catalog; FK added after InnoDB conversion |
| 15 | `Payment` | MyISAM | Keep archive → map | `Order` entity | Payment records mapped to orders; FK added after InnoDB conversion |
| 16 | `Students_Results` | MyISAM | Keep archive → map | `UserSession` ↔ `UserResult` relationship | Historical session-result links; FK added after InnoDB conversion |
| 17 | `Candidates_Results` | MyISAM | Keep archive → map | `CandidateSession` ↔ `CandidateResult` relationship | Historical candidate session-result links; FK added after InnoDB conversion |
| 18 | `StudentAnswers` | MyISAM | Keep archive → map | `UserSession.answerId` | Maps user answers to answer options; FK added after InnoDB conversion |
| 19 | `CandidateAnswers` | MyISAM | Keep archive → map | `CandidateSession.answerId` | Maps candidate answers to answer options; FK added after InnoDB conversion |

## Summary

- **Total legacy tables inventoried**: 19
- **Tables migrated to new v3 InnoDB tables**: 6 (`Users`, `Companies`, `Students`, `Results`, `Candidates`, `Candidates_results`)
- **Tables kept as read-only archive references**: 13
- **Tables dropped**: 0
- **Foreign keys added in architecture foundation**: 0 (deferred until MyISAM → InnoDB conversion)

## Notes

- This inventory MUST be updated if the legacy schema changes during development.
- Any future proposal to drop a legacy table requires explicit justification and documented approval per the project constitution.
- Natural-key mappings for the one-time migration are documented in `data-model.md` and `research.md`.
