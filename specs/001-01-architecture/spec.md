# Feature Specification: Architecture Foundation

**Feature Branch**: `001-01-architecture`

**Created**: 2026-08-08

**Status**: Draft

**Input**: User description: "Read .spec/spec.md, .spec/database.md, .spec/specs/01-architecture.md, and specs/001-01-architecture/spec.md. Identify underspecified areas, missing acceptance criteria, and contradictions for the architecture feature."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Define Project-Wide Architecture (Priority: P1)

As a development lead, I need a documented, layered architecture so that all subsequent features are implemented with consistent dependency direction, testability, and replaceable infrastructure.

**Why this priority**: Architecture decisions are foundational; without them later features will entangle business logic with frameworks and databases, making the codebase unmaintainable.

**Independent Test**: Review the architecture specification and verify that the dependency graph forbids Domain → Infrastructure edges, that every layer has a concrete example, and that Docker is absent from the development workflow.

**Acceptance Scenarios**:

1. **Given** the architecture spec, **When** a developer reads the layer diagram, **Then** they can identify where a new use case, repository, and controller belong without asking the team.
2. **Given** a proposed change, **When** it introduces framework-specific code in the Domain layer, **Then** the architecture spec explicitly forbids it and CI checks can detect it.

---

### User Story 2 - Align Architecture with Legacy Database (Priority: P2)

As a migration engineer, I need the architecture to treat the existing MySQL `evaluateme` database as the single source of truth so that no legacy data is lost and new tables integrate cleanly.

**Why this priority**: The legacy database contains production users, questions, results, and orders; recreating or ignoring it would destroy historical data and break continuity.

**Independent Test**: Inspect the architecture and database mapping documents; confirm that all legacy tables are listed as "keep" or "map", no table is marked for drop, and the persistence abstraction points to MySQL as the primary provider.

**Acceptance Scenarios**:

1. **Given** the database mapping, **When** the migration plan is reviewed, **Then** every v3 entity maps to an existing legacy table or a clearly named new table.
2. **Given** a new feature that needs persistence, **When** developers implement it, **Then** they use repository ports rather than direct SQL or ORM calls in the Application layer.

---

### User Story 3 - Establish Module Boundaries (Priority: P3)

As a backend developer, I need a documented module list so that I know which bounded contexts exist and how they interact without creating circular dependencies.

**Why this priority**: Clear module boundaries prevent shared-kernel bloat and make parallel feature development possible.

**Independent Test**: Review the module table and verify that each module has a single responsibility and that cross-module dependencies are listed or explicitly forbidden.

**Acceptance Scenarios**:

1. **Given** the module list, **When** a new feature is planned, **Then** it can be assigned to exactly one module or a pair of modules with a defined integration contract.

---

### Edge Cases

- What happens when a new feature does not clearly fit an existing module? → Require new module proposal and architecture review.
- How does the system enforce that no Domain layer code imports Infrastructure packages? → Static analysis / lint rule in CI.
- What if a developer proposes Docker for local development? → Rejected per constitution; local environment uses native tooling and the existing MySQL instance.
- How is the Domain → Infrastructure import rule enforced in CI? → ESLint `import/no-restricted-paths` rule rejects imports from `@nestjs/*`, `@prisma/client`, `next`, and `react` into `packages/domain/src`; CI runs `npm run lint` including the domain workspace.
- What defines the Phase 2 foundation checkpoint? → `npm run lint`, `npm run typecheck`, `npm run db:generate`, unit tests, and the API health integration test all pass; version-controlled SQL migrations exist, but applying them to the real legacy DB is a separate deployment step, not a gate for starting user stories.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST define a layered architecture with Presentation, API, Application, Domain, and Infrastructure layers.
- **FR-002**: System MUST ensure the Domain layer has no dependencies on Application, Infrastructure, or Presentation layers, and MUST forbid all TypeScript error-suppression directives (`@ts-ignore`, `@ts-nocheck`, `@ts-expect-error`) in production code.
- **FR-003**: System MUST use MySQL (existing `evaluateme` database) as the primary persistence store.
- **FR-004**: System MUST persist all legacy data; no legacy table may be dropped as part of v3 architecture foundation.
- **FR-005**: System MUST provide repository/port abstractions so that another SQL database can replace MySQL without changing Domain or Application code.
- **FR-011**: System MUST unify personal users, companies, and admins in a single `users` table with `role` (`user`, `company`, `admin`) and optional `company_profile_id`, preserving the global email uniqueness rule. Existing legacy `users` rows are migrated by setting `role` from legacy `role` and `activation_status` from legacy `status` (`1` → `active`, `0` → `pending`).
- **FR-006**: System MUST list all backend modules and their responsibilities.
- **FR-007**: System MUST define a project structure for `apps/web` (Next.js App Router), `apps/api` (NestJS with Prisma `mysql` provider), `packages/domain`, `packages/prisma`, and shared configuration.
- **FR-012**: System MUST standardize the frontend on Next.js App Router for server-side rendering, SEO, and API-first consumption.
- **FR-013**: System MUST standardize authentication interfaces as JWT for personal users and admins, and session-based tokens for companies and candidates taking tests; full implementation is deferred to feature 005, but the contract layer belongs to the architecture foundation.
- **FR-014**: System MUST standardize REST API versioning via URL path prefix `/api/v1/` for all backend endpoints.
- **FR-015**: System MUST rehash legacy MD5 password hashes to bcrypt on the user's next successful login and invalidate the old MD5 hash; new passwords MUST be stored with bcrypt only via a domain `IPasswordHasher` port implemented in Infrastructure.
- **FR-016**: System MUST define lifecycle states for v3 session and result entities as `pending`, `in_progress`, `completed`, `abandoned`, `archived`.
- **FR-008**: System MUST specify which existing legacy tables map to v3 entities and which new tables are required.
- **FR-009**: System MUST create new v3 tables for sessions and results (`user_sessions`, `user_results`, `candidate_sessions`, `candidate_results`) instead of repurposing legacy MyISAM tables directly.
- **FR-010**: System MUST provide a one-time migration job that copies legacy session and result data from `Students`/`Results`/`Candidates`/`Candidates_results` into the new v3 InnoDB tables (`user_sessions`, `user_results`, `candidate_sessions`, `candidate_results`) without deleting or modifying original legacy rows. The migration MUST be idempotent and runnable repeatedly without duplicating data, using natural business keys (`session_id` + `question_id` for sessions, `result_code` for results).

### Key Outputs

- **architecture_specification**: Documented layering decisions, module boundaries, and repository pattern usage.
- **legacy_database_mapping**: Table-by-table mapping between legacy MySQL schema and v3 domain entities.
- **module_catalog**: Backend modules (`auth`, `users`, `companies`, `campaigns`, `technologies`, `tests`, `test-engine`, `access-codes`, `candidates`, `payments`, `results`, `admin`, `notifications`) with responsibilities and explicit assignment of P1/P2 features from `.spec/spec.md`.
- **unified_account_model**: Single `users` table for personal users, companies, and admins with role-based differentiation and optional `company_profile_id`.
- **company_profile**: Child table with company-specific fields (`company_name`, `address`, `phone`, `country`, `occupation`, `available_tests`, `available_access_codes`) linked to `users.id` via `user_id`. Keeps `users` table normalized and preserves legacy `Companies` data. The migration from legacy `Companies` is idempotent: existing `company_profile` rows are skipped on re-runs; only missing profiles for linked `users` are created.
- **credit_settings**: Key-value table for admin-configurable credit economy: `personal_credit_price`, `company_access_code_price`, `personal_bonus_credits_default`, `company_bonus_credits_default`.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Architecture spec contains zero references to Docker or container-dependent workflows. This is also enforced cross-repo by `.github/workflows/spec-check.yml`.
- **SC-002**: Architecture spec contains zero references to PostgreSQL as the primary database; MySQL is explicitly named. This is also enforced cross-repo by `.github/workflows/spec-check.yml`.
- **SC-003**: Every layer in the architecture diagram has at least one concrete example from the EvaluateMe domain.
- **SC-007**: Backend framework is explicitly selected as NestJS + Prisma (`mysql` provider); no FastAPI or alternative backend remains in the active architecture spec.
- **SC-008**: Account model is unified into a single `users` table; legacy `Companies` data migrates into `users` with `role = 'company'` and an associated `company_profile`.
- **SC-009**: Frontend is explicitly standardized on Next.js App Router; no Pages Router or SPA-only approach remains in the active architecture spec.
- **SC-010**: Authentication model is explicitly standardized; JWT is used for personal users and admins, session-based tokens for companies and candidates.
- **SC-011**: Foundation API performance targets are defined as p95 <200 ms for health checks and simple CRUD endpoints, and p95 <500 ms for aggregate/report endpoints.
- **SC-012**: REST API versioning is explicitly standardized on URL path prefix `/api/v1/` for all backend endpoints.
- **SC-013**: Legacy password migration strategy is defined: MD5 hashes are rehashed to bcrypt on next successful login and old MD5 hashes are invalidated.
- **SC-014**: v3 session and result entity lifecycle states are explicitly defined as `pending`, `in_progress`, `completed`, `abandoned`, `archived`.
- **SC-004**: 100% of legacy tables from `specs/001-01-architecture/database.md` are accounted for in the v3 mapping (kept, mapped, or explicitly ignored with justification).
- **SC-005**: Module catalog is complete; no P1 or P2 feature from the main spec lacks an assigned module. A feature-to-module assignment table is documented in `docs/architecture/modules.md` and summarized in the spec.
- **SC-006**: Architecture spec defines the migration strategy for `Students`/`Results`/`Candidates`/`Candidates_results` to new v3 InnoDB tables.

## Layered Architecture

```
┌─────────────────────────────────────────────────────────────┐
│  Presentation (apps/web, apps/api controllers)              │
│  - Next.js App Router pages, React components               │
│  - NestJS Controllers (e.g., HealthController)              │
├─────────────────────────────────────────────────────────────┤
│  API / Application (apps/api application/use-cases)           │
│  - HealthCheckUseCase                                        │
│  - Orchestrates Domain entities through ports               │
├─────────────────────────────────────────────────────────────┤
│  Domain (packages/domain)                                     │
│  - User, CompanyProfile, Campaign entities                  │
│  - Repository ports (IUserRepository, etc.)                 │
│  - No imports from @nestjs/*, @prisma/client, next, react   │
├─────────────────────────────────────────────────────────────┤
│  Infrastructure (apps/api infrastructure)                     │
│  - Prisma repositories (PrismaUserRepository)               │
│  - PrismaService, config, logging, migrations                │
└─────────────────────────────────────────────────────────────┘
```

Dependency direction: Presentation/API → Application → Domain. Infrastructure implements Domain ports and is injected from outside.

## Architecture & Non-Functional Constraints *(mandatory)*

- Business logic MUST be framework-independent and live in Domain and Application layers.
- External input MUST be validated; database access MUST use parameterized queries or equivalent safe bindings.
- Persistence MUST be abstracted so the primary MySQL store can be replaced by another SQL database without changing Domain or Application code.
- API endpoints MUST meet foundation performance targets: p95 <200 ms for health checks and simple CRUD; p95 <500 ms for aggregate/report endpoints.
- The feature MUST be testable with unit, integration, and API tests without Docker or container-dependent workflows.
- Docker and all container-dependent workflows are strictly prohibited.
- All TypeScript error-suppression directives (`@ts-ignore`, `@ts-nocheck`, `@ts-expect-error`) are strictly forbidden in production code.

## Clarifications

### Session 2026-08-09

- **Q**: Which authentication and session model should the architecture standardize on? → **A**: JWT for authenticated users (personal users and admins); session-based tokens for companies and candidates taking tests. JWTs provide stateless API access for main user workflows; session-based tokens preserve test-execution context and candidate integrity.
- **Q**: What response-time targets should the architecture define for API endpoints at the foundation level? → **A**: p95 <200 ms for health checks and simple CRUD endpoints; p95 <500 ms for aggregate/report endpoints.
- **Q**: What API versioning strategy should the architecture standardize on for REST endpoints? → **A**: URL path versioning (`/api/v1/...`) for all REST endpoints.
- **Q**: How should the architecture handle the legacy MD5 password hashes during the transition? → **A**: Legacy MD5 hashes are rehashed to bcrypt on the user's next successful login; the old MD5 hash is invalidated after rehashing.
- **Q**: What lifecycle states should session/result entities support in the v3 data model? → **A**: Minimal state enum: `pending`, `in_progress`, `completed`, `abandoned`, `archived`.

### Session 2026-08-08

- **Q**: Which spec file is authoritative for the architecture feature, and how should contradictions with the project constitution (Docker/PostgreSQL) be resolved? → **A**: Use `specs/001-01-architecture/spec.md` as the active feature spec, remove Docker and PostgreSQL references, and align the architecture with the constitution (MySQL-only, Docker-prohibited). The detailed architecture content from `.spec/specs/01-architecture.md` is imported into this spec with contradictions resolved.
- **Q**: Should new v3 session/result tables be created, or should legacy `Students`/`Results`/`Candidates`/`Candidates_results` tables be repurposed? → **A**: Create new v3 InnoDB tables (`user_sessions`, `user_results`, `candidate_sessions`, `candidate_results`) and migrate/synchronize legacy data into them while preserving original legacy rows.
- **Q**: Which backend framework and ORM should the architecture standardize on, given the NestJS/FastAPI ambiguity in the legacy-to-new mapping? → **A**: NestJS + Prisma with `mysql` provider. FastAPI is removed from the active architecture spec.
- **Q**: Should personal users and companies share a single account table, or remain in separate legacy tables? → **A**: Unify accounts into a single `users` table with `role` (`user`, `company`, `admin`) and optional `company_profile_id`; legacy `Companies` data migrates into this model with an associated `company_profile`.
- **Q**: Should the frontend use Next.js App Router, Pages Router, or a plain React SPA? → **A**: Next.js App Router is the standard frontend architecture.
- **Q**: What key is used for idempotency when migrating legacy session/result rows into new v3 InnoDB tables? → **A**: Natural business keys: `session_id` + `question_id` for `user_sessions`/`candidate_sessions`, and `result_code` for `user_results`/`candidate_results`.
- **Q**: How should existing legacy personal `users` rows be represented in the unified account model? → **A**: Migration sets `role` from legacy `role` and `activation_status` from legacy `status` (`1` → `active`, `0` → `pending`).
- **Q**: What should `migrateCompanies` do when a `company_profile` already exists for a legacy company? → **A**: Skip the profile; only create missing profiles. Existing profiles are never overwritten by the one-time migration.
- **Q**: Is ESLint sufficient for CI enforcement of the Domain → Infrastructure import rule, or are additional tools required? → **A**: ESLint `import/no-restricted-paths` is sufficient for the foundation; no additional tools are required.
- **Q**: What is the completion criterion for Phase 2 before user stories begin? → **A**: Lint, typecheck, Prisma generate, unit tests, and health integration test all pass; migrations are version-controlled, but running them against the real legacy DB is a separate deployment step.
- **Q**: How is the feature-to-module assignment for P1/P2 features captured? → **A**: In `docs/architecture/modules.md` with a table mapping each P1/P2 feature from `.spec/spec.md` to its primary backend module and integration contract where needed.
- **Q**: Which credit-economy settings are configured via `credit_settings`? → **A**: `personal_credit_price`, `company_access_code_price`, `personal_bonus_credits_default`, `company_bonus_credits_default`.

## Assumptions

- The existing MySQL 5.7 instance at `192.168.1.132` is reachable for development.
- Local development relies on native tooling, not Docker or containers.
- Prisma will use the `mysql` provider and generate repository implementations in the Infrastructure layer.
- Legacy MD5 passwords are rehashed to bcrypt on the user's next successful login; the old MD5 hash is invalidated after rehashing.
- Foreign keys are not added until legacy MyISAM tables are converted to InnoDB.
