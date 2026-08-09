# ADR-002: Legacy Database Strategy

## Status

Accepted

## Context

EvaluateMe v3 must replace a legacy v2 MySQL database that contains business-critical data in MyISAM tables (Users, Companies, Students, Results, Candidates, Candidates_results, etc.). The new architecture requires InnoDB tables, foreign keys, and a clean domain model.

## Decision

We will:

1. **Keep legacy tables read-only** and not alter or drop them during the architecture foundation phase.
2. **Create new v3 InnoDB tables** alongside the legacy tables (e.g., `user_sessions`, `user_results`, `candidate_sessions`, `candidate_results`, `company_profiles`).
3. **Add non-destructive v3 columns** to the existing `users` table (`role`, `activation_status`, `password_hash`, `company_profile_id`).
4. **Migrate data idempotently** from legacy tables into v3 tables using natural keys (`session_id` + `question_id`, `result_code`, `email`).
5. **Avoid foreign keys from v3 tables to legacy MyISAM tables** until those legacy tables are converted to InnoDB.

## Consequences

### Positive

- Legacy data is preserved exactly as-is; rollback is trivial.
- v3 can develop its own normalized schema without fighting MyISAM limitations.
- Idempotent migrations allow re-running safely during deployment and local development.
- Clear boundary between legacy and v3 data simplifies later table-by-table migration.

### Negative

- Some data is duplicated between legacy and v3 tables temporarily.
- Queries that join legacy and v3 data cannot use foreign keys yet.
- Developers must remember to treat legacy tables as read-only.

## Migration Safety

All migration code uses a `MigrationGuard` that blocks destructive SQL keywords (`DROP`, `DELETE`, `TRUNCATE`, etc.) unless an explicit `--force-destructive` flag is passed and logged. This reduces the risk of accidental data loss when running migrations.

## References

- `docs/architecture/legacy-database-mapping.md`
- `packages/prisma/migrations/`
- `apps/api/src/infrastructure/migrations/`
