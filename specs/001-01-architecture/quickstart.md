# Quickstart: Architecture Foundation

This guide validates that the architecture foundation is correctly set up and aligned with the spec and constitution.

## Prerequisites

- Node.js >=20.0.0 installed locally
- npm >=10.0.0 (with workspace support)
- MySQL 5.7 reachable via `DATABASE_URL` (default `192.168.1.132:3306`)
- No Docker or container tooling required

## Environment Setup

1. Copy the environment template:

```bash
cp .env.example .env
```

2. Edit `.env` with your MySQL credentials, JWT secrets, and API port.

3. Install dependencies:

```bash
npm ci
```

## Build & Typecheck

```bash
npm run build
npm run typecheck
```

Expected: zero TypeScript errors across all workspaces.

## Lint

```bash
npm run lint
```

Expected: no ESLint violations, including:

- No `any`, `@ts-ignore`, `@ts-nocheck`, `@ts-expect-error` in production code.
- No imports from `@nestjs/*`, `@prisma/client`, `next`, or `react` into `packages/domain/src`.

## Database

```bash
npm run db:generate --workspace=packages/prisma
npm run db:status --workspace=packages/prisma
```

> Do not run Prisma migrations against the production legacy database until an explicit deployment plan is approved.

## Tests

```bash
npm run test
npm run test:integration
```

`test:integration` requires a reachable `DATABASE_URL`. Integration tests skip when the database is not available.

## Start Services

```bash
# API
npm run dev:api

# Frontend (new terminal)
npm run dev:web
```

Verify the health endpoint:

```bash
curl http://localhost:3001/api/v1/health
```

Expected response:

```json
{
  "success": true,
  "data": {
    "status": "ok",
    "database": "ok",
    "timestamp": "..."
  }
}
```

Response time target: p95 <200 ms.

## Module Cycle Check

```bash
bash scripts/check-module-cycles.sh
```

## Constitution Compliance

Confirm no Docker references:

```bash
grep -R -i "docker\|docker-compose\|container" specs/ .github/workflows/ docs/ || echo "No Docker references"
```

## API Versioning

```bash
grep -R "@Controller('/api/v1" apps/api/src/modules/
```

## Migration Reconciliation

To run the one-time idempotent migration from legacy tables to new v3 InnoDB tables:

```bash
# Only after explicit approval and on a copy of the legacy database
npm run migrate:legacy
```

This copies legacy `Students`/`Results`/`Candidates`/`Candidates_results` rows into
`user_sessions`/`user_results`/`candidate_sessions`/`candidate_results` without
modifying or deleting original legacy rows.

## Validation Checklist

Before any subsequent feature (auth, users, etc.) can start, the following MUST pass:

- [ ] `npm run lint` passes.
- [ ] `npm run typecheck` passes.
- [ ] `npm run db:generate --workspace=packages/prisma` succeeds.
- [ ] `npm run test` passes.
- [ ] `GET /api/v1/health` integration test passes with p95 <200 ms.
- [ ] `GET /api/v1/technologies` integration test passes.
- [ ] `bash scripts/check-module-cycles.sh` finds no cycles.
- [ ] Version-controlled migrations exist in `packages/prisma/migrations/`.
- [ ] No Docker or container-dependent workflow is used.

## Notes

- The foundation creates new v3 InnoDB tables alongside legacy tables; it does not drop or alter legacy tables destructively.
- If any validation step fails, fix the architecture before proceeding to feature implementation.
