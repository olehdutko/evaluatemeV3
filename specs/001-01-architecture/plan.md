# Implementation Plan: Architecture Foundation

**Branch**: `001-01-architecture` | **Date**: 2026-08-09 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/001-01-architecture/spec.md`

## Summary

Establish the foundational architecture for EvaluateMe.IT v3.0: a Clean Architecture monorepo with a Next.js App Router frontend (`apps/web`), a NestJS + Prisma (`mysql` provider) backend (`apps/api`), a shared pure TypeScript domain package (`packages/domain`), and Prisma schema/migrations (`packages/prisma`). The work covers layered structure, module boundaries, repository ports, legacy database mapping, and a one-time idempotent migration strategy for sessions/results into new InnoDB tables, all without Docker and preserving existing `evaluateme` data.

## Technical Context

**Language/Version**: TypeScript 5.x, Node.js LTS

**Primary Dependencies**: NestJS 10.x, Prisma 5.x (`mysql` provider), Next.js 14.x (App Router), Zod (input validation), jsonwebtoken (JWT)
- **Deferred Dependencies**: BullMQ (background jobs) — introduced in notifications/payments features, not architecture foundation

**Storage**: MySQL 5.7, existing `evaluateme` database on `192.168.1.132:3306`

**Testing**: Jest (unit + integration), Supertest/Playwright (API/E2E smoke)

**Target Platform**: Linux server / macOS local development

**Project Type**: web-service

**Performance Goals**: Not a runtime performance feature; baseline targets deferred to subsequent feature plans.

**Constraints**:
- No Docker or container-dependent workflows.
- No `any`, `@ts-ignore`, `@ts-nocheck`, or `@ts-expect-error` in production code.
- Domain and Application layers must not depend on Infrastructure/Presentation.
- All legacy data preserved; destructive migrations require explicit approval.
- Foreign keys added only after MyISAM → InnoDB conversion.

**Scale/Scope**: Foundation for ~5 actors, ~13 backend modules, ~20 legacy tables plus ~9 new v3 tables.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] **I. Clean Architecture**: Domain has no dependencies on Application, Infrastructure, or Presentation layers.
- [x] **II. TypeScript Discipline**: Strict mode enabled; no `any`, `@ts-ignore`, `@ts-nocheck`, or `@ts-expect-error`.
- [x] **III. Lightweight Use-Case Backend**: Controllers are thin; business logic lives in Application use cases/services.
- [x] **IV. Persistence & Legacy Database Care**: Persistence hidden behind repository/port abstractions; no SQL/ORM in Domain or Application.
- [x] **V. Testing, Validation & Security**: External input validated at boundaries; parameterized database access; centralized validated config.
- [x] **VI. Modularity, Replaceability & Simplicity**: Cohesive modules organized around business capabilities; no global mutable state.
- [x] **VII. Spec-Driven Development**: Specifications are the source of truth; architectural decisions and migrations documented.
- [x] **Additional Constraints**: Docker prohibited; framework-specific code isolated from Domain/Application layers.

## Project Structure

### Documentation (this feature)

```text
specs/001-01-architecture/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
│   └── api-conventions.md
└── tasks.md             # Phase 2 output (/speckit.tasks command)
```

### Source Code (repository root)

```text
evaluateme-v3/
├── apps/
│   ├── web/                  # Next.js App Router frontend
│   │   ├── src/
│   │   │   ├── app/          # App Router pages + layouts
│   │   │   ├── components/   # Reusable React components
│   │   │   └── lib/          # Shared frontend utilities + API client
│   │   ├── tests/            # Frontend unit + integration tests
│   │   └── package.json
│   └── api/                  # NestJS backend
│       ├── src/
│       │   ├── modules/      # Feature modules (auth, users, campaigns, ...)
│       │   │   ├── auth/     # Authentication module (deferred to feature 005)
│       │   │   ├── users/    # User management module (deferred to feature 005)
│       │   │   ├── companies/# Company profiles module (deferred to feature 005)
│       │   │   ├── campaigns/# Campaign management module (deferred to feature 005)
│       │   │   ├── technologies/
│       │   │   ├── tests/
│       │   │   ├── test-engine/
│       │   │   ├── access-codes/
│       │   │   ├── candidates/
│       │   │   ├── payments/
│       │   │   ├── results/
│       │   │   ├── admin/
│       │   │   └── notifications/
│       │   ├── application/  # Use cases / services (thin orchestration)
│       │   │   ├── health/   # HealthCheckUseCase, etc.
│       │   │   └── ...       # Deferred to individual feature modules
│       │   ├── domain/       # Pure TS entities & repository ports (NO NestJS/Prisma imports)
│       │   └── infrastructure/
│       │       ├── prisma/     # PrismaService, schema, migrations bootstrap
│       │       ├── repositories/# Repository implementations (PrismaUserRepository, etc.)
│       │       ├── email/      # Email delivery adapter (deferred)
│       │       └── config/     # Centralized validated configuration
│       ├── tests/
│       │   ├── unit/         # Unit tests for application + infrastructure
│       │   ├── integration/  # Integration tests (API endpoints, DB interactions)
│       │   └── contract/     # Contract tests (API response shapes)
│       └── package.json
├── packages/
│   ├── domain/               # Shared domain types, entities, ports (pure TS)
│   │   ├── src/
│       │   ├── entities/     # User, CompanyProfile, Campaign, Test, Question, Answer
│       │   ├── ports/        # IUserRepository, ICampaignRepository, etc.
│       │   └── index.ts      # Barrel exports for domain layer
│   ├── prisma/               # Prisma schema, migrations, seed scripts
│   │   ├── schema.prisma     # Central Prisma schema (mysql provider)
│   │   └── migrations/       # Version-controlled SQL migrations
│   └── ts-config/            # Shared TypeScript configuration base
├── .github/workflows/
│   ├── ci.yml                # Lint, typecheck, unit tests on every PR
│   └── spec-check.yml        # Validates no Docker/PostgreSQL references in specs
├── docs/
│   └── architecture/         # Architectural Decision Records (ADRs)
├── .env.example              # MySQL, JWT secrets, OAuth placeholder
└── package.json              # Root workspace config (npm workspaces)
```

**Structure Decision**: Monorepo with `apps/web` (Next.js App Router) and `apps/api` (NestJS). Business logic lives in `packages/domain` and `apps/api/src/application` with strict import rules enforced by ESLint. Prisma is confined to `packages/prisma` and `apps/api/src/infrastructure`. No Docker; local dev connects directly to existing MySQL 5.7 at `192.168.1.132:3306`.

## Complexity Tracking

> No constitution violations identified. Complexity is justified by the need to support Clean Architecture, replaceable infrastructure, and legacy data preservation.

## Phase 0: Research

Research tasks (captured in `research.md`):

1. **NestJS + Prisma `mysql` best practices** for Clean Architecture layering — how to inject repository implementations, manage Prisma lifecycle in NestJS, and keep domain ports framework-independent.
2. **MyISAM → InnoDB conversion strategy** for legacy tables without data loss — this is a future, explicitly justified migration; architecture phase only reads legacy tables and creates new InnoDB tables.
3. **Idempotent migration patterns** for copying legacy `Students`/`Results`/`Candidates`/`Candidates_results` into new v3 InnoDB tables — natural business key deduplication.
4. **Monorepo tooling selection** (npm workspaces vs pnpm) — chosen npm workspaces for minimal justified dependencies and broad tooling compatibility.
5. **Next.js App Router API client patterns** for consuming a separate NestJS backend — REST client with Zod-validated responses.

## Phase 1: Design

### Data Model

Documented in `data-model.md`:

- **v3 domain entities**: `User`, `CompanyProfile`, `Campaign`, `CampaignHistory`, `Technology`, `Test`, `Question`, `Answer`, `FreeSampleQuestion`, `UserSession`, `UserResult`, `AccessCode`, `CandidateSession`, `CandidateResult`, `Order`, `EmailTemplate`, `LandingAd`, `CreditSetting`.
- **Legacy mappings**: every legacy table from the database mapping document maps to a v3 entity or is explicitly marked as archive/temp/ignored.
- **New tables**: `campaigns`, `campaign_history`, `email_templates`, `landing_ads`, `credit_settings`, `user_sessions`, `user_results`, `candidate_sessions`, `candidate_results`, `company_profiles`.
- **Legacy table inventory**: `specs/001-01-architecture/database.md` lists all legacy tables and their v3 treatment.
- **Legacy table modifications**: `users` table gains v3 columns (`role`, `activation_status`, `password_hash`, `company_profile_id`); original columns preserved.

### Contracts

Stored in `contracts/`:

- `api-conventions.md`: REST conventions, error envelope, pagination, content-type.
- `auth-contract.md` is intentionally deferred to the auth feature (005); architecture only defines cross-cutting API conventions.

### Quickstart

Documented in `quickstart.md`:

- Environment variables (`.env`) for MySQL connection, JWT secrets, and generic OAuth placeholder.
- Commands to install dependencies (`npm ci`), run Prisma migrations (`npx prisma migrate deploy`), start NestJS API (`npm run start:dev --prefix apps/api`) and Next.js dev server (`npm run dev --prefix apps/web`).
- Validation steps: health endpoint returns 200, layered import lint check passes (`npm run lint`), migration dry-run succeeds.

### Module Catalog

| Module | Responsibility | Constitution Principle |
|--------|---------------|----------------------|
| `auth` | JWT issuance, login, password hashing (MD5→bcrypt transition) | III, V |
| `users` | Unified account CRUD (personal users, companies, admins) | I, IV |
| `companies` | Company profile management linked to unified accounts | I, VI |
| `campaigns` | Campaign creation, tracking, history | I, IV |
| `technologies` | Technology catalog for tests | I, VI |
| `tests` | Test creation, question assignment, status tracking | I, IV |
| `test-engine` | Runtime test execution, scoring, session management | III, V |
| `access-codes` | Access code generation, validation, redemption | III, IV |
| `candidates` | Candidate management and session/result tracking | I, IV |
| `payments` | Credit economy, order processing (deferred BullMQ) | III, V |
| `results` | Result aggregation, reporting, analytics | I, IV |
| `admin` | Admin configuration (credit settings, email templates, landing ads) | III, VI |
| `notifications` | Email/notification delivery (deferred BullMQ) | III, V |

Cross-module dependencies are unidirectional where possible. Circular dependencies must be resolved through the Domain layer ports.

### Legacy Database Mapping

| Legacy Table | v3 Treatment | Notes |
|-------------|-------------|-------|
| `Users` | Keep + migrate (unified accounts) | Gains v3 columns; role/activation_status derived from legacy fields |
| `Companies` | Keep + migrate (company profiles) | Creates `company_profiles`; original rows preserved read-only |
| `Students` | Keep + migrate (sessions) → `user_sessions` | New InnoDB table; idempotent copy via natural keys |
| `Results` | Keep + migrate (results) → `user_results` | New InnoDB table; idempotent copy via natural keys |
| `Candidates` | Keep + migrate (sessions) → `candidate_sessions` | New InnoDB table; idempotent copy via natural keys |
| `Candidates_results` | Keep + migrate (results) → `candidate_results` | New InnoDB table; idempotent copy via natural keys |
| `StudentQuestions` (MyISAM) | Keep archive table | Read-only reference; FK added after InnoDB conversion |
| `Questions` (MyISAM) | Keep archive table | Read-only reference; FK added after InnoDB conversion |
| `Technologies` (MyISAM) | Keep archive table → maps to v3 entities | FK added after InnoDB conversion |
| `TestQuestions` (MyISAM) | Keep archive table → maps to v3 entities | FK added after InnoDB conversion |
| `EmailTemplate` (MyISAM) | Keep archive table → maps to v3 entities | FK added after InnoDB conversion |
| `LandingAd` (MyISAM) | Keep archive table → maps to v3 entities | FK added after InnoDB conversion |
| `Orders` (MyISAM) | Keep archive table → maps to v3 entities | FK added after InnoDB conversion |
| `AccessCodes` (MyISAM) | Keep archive table → maps to v3 entities | FK added after InnoDB conversion |
| `Payment` (MyISAM) | Keep archive table → maps to v3 entities | FK added after InnoDB conversion |
| `Students_Results` (MyISAM) | Keep archive table → maps to v3 entities | FK added after InnoDB conversion |
| `Candidates_Results` (MyISAM) | Keep archive table → maps to v3 entities | FK added after InnoDB conversion |
| `StudentAnswers` (MyISAM) | Keep archive table → maps to v3 entities | FK added after InnoDB conversion |
| `CandidateAnswers` (MyISAM) | Keep archive table → maps to v3 entities | FK added after InnoDB conversion |

All 20+ legacy tables accounted for. No table is dropped in this phase.

## Phase 2: Implementation Gates

Before user story implementation can begin, the following gates MUST pass:

1. **Build**: `npm run build` succeeds across all workspaces with zero TypeScript errors.
2. **Lint**: `npm run lint` passes with no violations, including Domain import restrictions.
3. **Typecheck**: `npx tsc --noEmit` confirms strict mode across all packages.
4. **Prisma Generate**: `npx prisma generate` succeeds; schema compiles without errors.
5. **Unit Tests**: All unit tests pass (Jest) in `apps/api/tests/unit/` and `packages/domain`.
6. **Health Integration Test**: API health endpoint responds 200 with valid JSON; database connection verified.
7. **Migration Dry-Run**: `npx prisma migrate status` shows no pending migrations; existing legacy tables unaffected.

## Notes

- `packages/domain` is imported by `apps/api` and `apps/web` but must not import any infrastructure packages.
- Import lint rule: Domain may not import from `@nestjs/*`, `@prisma/client`, `next`, `react`.
- All Prisma repository implementations implement interfaces defined in Domain ports.
- Version-controlled migrations live in `packages/prisma/migrations/`.
- ADRs for architectural decisions are stored in `docs/architecture/`.
