# Quickstart: Architecture Foundation

This guide validates that the architecture foundation is correctly set up and aligned with the spec and constitution.

## Prerequisites

- Node.js LTS installed locally
- npm (with workspace support)
- MySQL 5.7 reachable at `192.168.1.132:3306` (or local `.env` override)
- No Docker or container tooling required

## Environment Setup

1. Copy the environment template:

```bash
cp .env.example .env
```

2. Edit `.env` with your MySQL credentials and JWT secrets:

```bash
# Database
DATABASE_URL="mysql://user:password@192.168.1.132:3306/evaluateme"

# JWT
JWT_SECRET="your-256-bit-secret"
JWT_REFRESH_SECRET="your-256-bit-refresh-secret"

# Generic OAuth placeholder (auth feature will define real providers)
OAUTH_PROVIDER_PLACEHOLDER="google"
OAUTH_CLIENT_ID=""
OAUTH_CLIENT_SECRET=""

# API
API_PORT=3001
```

3. Install dependencies:

```bash
npm ci
```

## Build & Typecheck

1. Build all workspaces:

```bash
npm run build
```

Expected: zero TypeScript errors across `packages/domain`, `packages/prisma`, `apps/api`, and `apps/web`.

2. Run typecheck:

```bash
npx tsc --noEmit
```

Expected: no type errors in strict mode.

## Lint

```bash
npm run lint
```

Expected: no ESLint violations, including:
- No `any`, `@ts-ignore`, `@ts-nocheck`, `@ts-expect-error` in production code.
- No imports from `@nestjs/*`, `@prisma/client`, `next`, or `react` into `packages/domain/src`.

## Database

1. Generate Prisma client:

```bash
npx prisma generate
```

2. Validate migration status (do not apply to production legacy DB during foundation):

```bash
npx prisma migrate status
```

Expected: migrations are version-controlled and pending against the target database.

3. Run migration dry-run against a local MySQL copy if available:

```bash
npx prisma migrate deploy --preview-feature
```

## Tests

1. Run unit tests:

```bash
npm run test
```

Expected: all unit tests pass.

2. Run integration tests (requires database connection):

```bash
npm run test:integration
```

Expected: API health integration test passes.

## Start Services

1. Start the NestJS API:

```bash
npm run start:dev --workspace=apps/api
```

2. In another terminal, start the Next.js frontend:

```bash
npm run dev --workspace=apps/web
```

3. Verify the health endpoint:

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

Response time target: p95 <200 ms for this endpoint.

## Layered Import Validation

Run the architecture import lint check:

```bash
npx eslint --max-warnings=0 'packages/domain/src/**/*.{ts,tsx}'
```

Expected: no violations proving Domain does not import Infrastructure/Presentation packages.

## Check Constitution Compliance

Confirm no Docker references exist:

```bash
grep -R -i "docker\|docker-compose\|container" specs/ .github/workflows/ || echo "No Docker references"
```

Expected: no matches.

## Check API Versioning

Confirm all backend controller routes are prefixed with `/api/v1`:

```bash
grep -R "@Controller('/api/v1" apps/api/src/modules/
```

Expected: controllers reference the `/api/v1` prefix.

## Migration Reconciliation

To run the one-time idempotent migration from legacy tables to new v3 InnoDB tables:

```bash
# Only after explicit approval and on a copy of the legacy database
npm run migrate:legacy
```

This command:
- Copies legacy `Students`/`Results`/`Candidates`/`Candidates_results` rows into `user_sessions`/`user_results`/`candidate_sessions`/`candidate_results`.
- Uses natural keys to avoid duplication.
- Does not modify or delete original legacy rows.

## What to Validate Before User Stories Begin

Before any subsequent feature (auth, users, etc.) can start, the following MUST pass:

- [ ] `npm run lint` passes.
- [ ] `npx tsc --noEmit` passes.
- [ ] `npx prisma generate` succeeds.
- [ ] `npm run test` passes.
- [ ] `GET /api/v1/health` integration test passes with p95 <200 ms.
- [ ] Version-controlled migrations exist in `packages/prisma/migrations/`.
- [ ] No Docker or container-dependent workflow is used.

## Notes

- Do not run Prisma migrations against the production legacy database until an explicit deployment plan is approved.
- The foundation phase creates new v3 InnoDB tables alongside legacy tables; it does not drop or alter legacy tables destructively.
- If any validation step fails, fix the architecture before proceeding to feature implementation.
