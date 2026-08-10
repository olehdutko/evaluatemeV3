# Decision Log

A concise summary of the architecture decisions recorded as ADRs.

## ADR-001: Clean Architecture with Strict Dependency Direction

- **Status**: Accepted
- **Decision**: Four-layer architecture: Domain → Application → Infrastructure/Presentation.
- **Enforcement**: ESLint `import/no-restricted-paths` blocks framework imports into `packages/domain/src`.
- **Impact**: Business rules are isolated from frameworks and databases; unit tests need no database.

## ADR-002: Legacy Database Strategy

- **Status**: Accepted
- **Decision**: Keep legacy MyISAM tables read-only; create new v3 InnoDB tables alongside them; add non-destructive v3 columns to `users`.
- **Migration approach**: One-time, idempotent migrations using natural keys (`session_id` + `question_id`, `result_code`, `email`).
- **Safety**: `MigrationGuard` blocks destructive SQL unless `--force-destructive` is passed and logged.
- **Impact**: Rollback is trivial; legacy data is preserved; v3 schema can evolve independently.

## ADR-003: Module Boundaries

- **Status**: Accepted
- **Decision**: Backend is divided into 13 modules (`auth`, `users`, `companies`, `campaigns`, `technologies`, `tests`, `test-engine`, `access-codes`, `candidates`, `payments`, `results`, `admin`, `notifications`).
- **Rules**: Each feature belongs to one module; circular dependencies are forbidden; modules communicate through domain ports/integration contracts.
- **Impact**: Clear ownership, easier parallel development, cycle detection in CI.

## Migration Strategy Summary

- Prisma migrations under `packages/prisma/migrations/` are version-controlled and non-destructive.
- Application-level migration code under `apps/api/src/infrastructure/migrations/` copies legacy data into v3 tables.
- Runner CLI at `apps/api/src/cli/run-migration.ts` supports `--dry-run` and `--migration-name`.
- Legacy tables are never altered or dropped during the architecture foundation phase.

## Where to Add New Decisions

Create a new ADR file under `docs/architecture/` using the format
`adr-NNN-short-name.md` and add a row above.
