# EvaluateMe.IT v3.0

Clean Architecture monorepo for EvaluateMe.IT v3.0 — a platform for creating,
running, and evaluating programming tests for personal users, companies, and
candidates.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 14 App Router (`apps/web`) |
| Backend | NestJS 10 (`apps/api`) |
| ORM / Database | Prisma 5 with MySQL 5.7 (`packages/prisma`) |
| Domain | Pure TypeScript shared package (`packages/domain`) |
| Language | TypeScript 5 with strict mode |
| Package Manager | npm workspaces |
| CI / CD | GitHub Actions (`.github/workflows/`) |

## Project Structure

```text
apps/
  web/              # Next.js App Router frontend
  api/              # NestJS backend
packages/
  domain/           # Domain entities and repository ports (no framework imports)
  prisma/           # Prisma schema and version-controlled migrations
  ts-config/        # Shared TypeScript configuration
docs/
  architecture/     # ADRs, layer diagrams, module catalog, legacy mapping
scripts/            # Local helper scripts and CI checks
specs/              # Feature specifications and contracts
```

## Quick Start

See [`specs/001-01-architecture/quickstart.md`](specs/001-01-architecture/quickstart.md)
for environment setup, build steps, and validation gates.

## Architecture Documentation

- [`docs/architecture/layers.md`](docs/architecture/layers.md) — Clean Architecture layers and dependency direction.
- [`docs/architecture/modules.md`](docs/architecture/modules.md) — 13 backend modules and their responsibilities.
- [`docs/architecture/adr-001-clean-architecture.md`](docs/architecture/adr-001-clean-architecture.md) — Layering decision.
- [`docs/architecture/adr-002-legacy-database-strategy.md`](docs/architecture/adr-002-legacy-database-strategy.md) — Legacy MySQL migration strategy.
- [`docs/architecture/adr-003-module-boundaries.md`](docs/architecture/adr-003-module-boundaries.md) — Module boundaries and cycle detection.
- [`docs/architecture/legacy-database-mapping.md`](docs/architecture/legacy-database-mapping.md) — Table-by-table legacy-to-v3 mapping.
- [`docs/architecture/decision-log.md`](docs/architecture/decision-log.md) — Summary of all ADRs and migration strategy.

## Available Scripts

Run these from the repository root:

| Command | Purpose |
|---------|---------|
| `npm run build` | Build all workspaces |
| `npm run lint` | Lint all workspaces |
| `npm run test` | Run unit tests across workspaces |
| `npm run test:integration` | Run integration tests (needs `DATABASE_URL`) |
| `npm run typecheck` | TypeScript check with no emit |
| `npm run dev:api` | Start NestJS in watch mode |
| `npm run dev:web` | Start Next.js dev server |

## Architecture Highlights

- **Domain** layer has zero framework imports; enforced by ESLint.
- **API versioning** — all routes are prefixed with `/api/v1`.
- **Legacy database** — original MyISAM tables stay read-only; new v3 InnoDB tables are created alongside them and populated idempotently.
- **Module boundaries** — 13 backend modules with forbidden circular dependencies, checked by `scripts/check-module-cycles.sh`.
- **Response envelope** — every API response uses `{ success, data, error?, meta? }`.

## Governance

This project follows the constitution in `.specify/memory/constitution.md`.
