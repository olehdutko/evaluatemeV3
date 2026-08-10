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
- **Migration approach**: One-time, idempotent migrations using natural keys.
- **Safety**: `MigrationGuard` blocks destructive SQL unless `--force-destructive` is passed and logged.
- **Impact**: Rollback is trivial; legacy data is preserved; v3 schema can evolve independently.

## ADR-003: Module Boundaries

- **Status**: Accepted
- **Decision**: Backend is divided into 13 modules with forbidden circular dependencies.
- **Rules**: Each feature belongs to one module; modules communicate through domain ports.
- **Impact**: Clear ownership, easier parallel development, cycle detection in CI.

## ADR-004: API Versioning Policy

- **Status**: Accepted
- **Decision**: All v3 endpoints under `/api/v1`; breaking changes require `/api/v2` with a deprecation period and an ADR.
- **Impact**: Stable consumer contracts and a documented path for API evolution.

## Migration Strategy Summary

- Prisma migrations under `packages/prisma/migrations/` are version-controlled and non-destructive.
- Application-level migration code under `apps/api/src/infrastructure/migrations/` copies legacy data into v3 tables.
- Runner CLI at `apps/api/src/cli/run-migration.ts` supports `--dry-run` and `--migration-name`.
- Legacy tables are never altered or dropped during the architecture foundation phase.

## Where to Add New Decisions

Create a new ADR file under `docs/architecture/` using the format
`adr-NNN-short-name.md` and add a row above.
