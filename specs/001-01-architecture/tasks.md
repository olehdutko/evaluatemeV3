# Tasks: Architecture Foundation

**Input**: Design documents from `/specs/001-01-architecture/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/api-conventions.md, quickstart.md

**Tests**: Tests are included because architecture validation requires executable gates.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic monorepo structure

- [x] T001 Create monorepo root structure in `evaluateme-v3/`: `apps/web`, `apps/api`, `packages/domain`, `packages/prisma`, `packages/ts-config`, `.github/workflows`, `docs/architecture`
- [x] T002 [P] Initialize root `package.json` with npm workspaces covering `apps/*` and `packages/*`; include dev scripts `build`, `lint`, `test`, `test:integration`
- [x] T003 [P] Configure `packages/ts-config/tsconfig.json` with TypeScript strict mode (`strict: true`, `noImplicitAny: true`, `strictNullChecks: true`) and extend it in `apps/web/tsconfig.json`, `apps/api/tsconfig.json`, `packages/domain/tsconfig.json`, and `packages/prisma/tsconfig.json`
- [x] T004 [P] Configure root ESLint in `.eslintrc.js` to forbid `any`, `@ts-ignore`, `@ts-nocheck`, `@ts-expect-error` and to enforce `import/no-restricted-paths` preventing `packages/domain/src/**/*` from importing `@nestjs/*`, `@prisma/client`, `next`, or `react`
- [x] T005 Configure GitHub Actions CI workflow in `.github/workflows/ci.yml` to run `npm ci`, `npm run lint`, `npx tsc --noEmit`, `npx prisma generate`, `npm run test`, and `npm run test:integration` on every PR
- [x] T006 [P] Configure GitHub Actions spec-check workflow in `.github/workflows/spec-check.yml` to reject PRs that add `docker`, `docker-compose`, or `postgresql` as primary database references under `specs/` and `docs/`
- [x] T007 [P] Add `.env.example` at repo root with `DATABASE_URL` (MySQL), `JWT_SECRET`, `JWT_REFRESH_SECRET`, generic OAuth placeholders, and `API_PORT`; ensure no Docker references

**Checkpoint**: Monorepo builds and lints successfully before any domain code is added.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T008 Create domain package structure in `packages/domain/src/entities/` and `packages/domain/src/ports/`; add `packages/domain/src/index.ts` barrel export
- [x] T009 [P] Define base entity types in `packages/domain/src/entities/base.entity.ts` (`id`, `createdAt`, `updatedAt`) and status enums (`UserRole`, `ActivationStatus`, `SessionStatus`)
- [x] T010 [P] Define repository ports in `packages/domain/src/ports/`: `IUserRepository.ts`, `ICompanyProfileRepository.ts`, `ICampaignRepository.ts`, `ITechnologyRepository.ts`, `ITestRepository.ts`, `IQuestionRepository.ts`, `IAnswerRepository.ts`, `IUserSessionRepository.ts`, `IUserResultRepository.ts`, `IAccessCodeRepository.ts`, `ICandidateSessionRepository.ts`, `ICandidateResultRepository.ts`
- [x] T011 Configure centralized validated config in `apps/api/src/infrastructure/config/app-config.ts` using Zod to parse `DATABASE_URL`, `JWT_SECRET`, `JWT_REFRESH_SECRET`, and `API_PORT`
- [x] T011a [P] Define authentication strategy ports in `packages/domain/src/ports/auth/jwt-strategy.port.ts` and `packages/domain/src/ports/auth/session-strategy.port.ts`, declaring token issuance/validation contracts for personal users/admins and session-based tokens for companies/candidates
- [x] T012 Configure structured logging in `apps/api/src/infrastructure/logging/logger.ts` with a simple adapter interface; no global mutable logger state
- [x] T013 Set up Prisma in `packages/prisma` with `mysql` provider, `schema.prisma` containing new v3 InnoDB tables (`campaigns`, `campaign_history`, `email_templates`, `landing_ads`, `credit_settings`, `user_sessions`, `user_results`, `candidate_sessions`, `candidate_results`, `company_profiles`), plus v3 additions to legacy `users` table (`role`, `activation_status`, `password_hash`, `company_profile_id`)
- [x] T014 [P] Create first version-controlled migration in `packages/prisma/migrations/` that adds new v3 tables and v3 `users` columns without dropping or altering existing legacy table data
- [x] T015 Implement `PrismaService` in `apps/api/src/infrastructure/prisma/prisma.service.ts` as a NestJS provider wrapping the Prisma client
- [x] T016 [P] Implement first Prisma repository example in `apps/api/src/infrastructure/prisma/repositories/prisma-user.repository.ts` implementing `IUserRepository`
- [x] T017 Set up NestJS `apps/api` with `AppModule`, `HealthModule` under `apps/api/src/modules/health/`, and strict workspace import lint rule verified by `npm run lint`
- [x] T018 Set up Next.js App Router `apps/web` with a minimal page in `apps/web/src/app/page.tsx` and a typed API client stub in `apps/web/src/lib/api-client.ts`
- [x] T019 [P] Create unit test scaffolding in `apps/api/tests/unit/`, `apps/web/tests/unit/`, and `packages/domain/tests/unit/`
- [x] T020 Create integration test scaffolding in `apps/api/tests/integration/` and `apps/web/tests/integration/`

**Checkpoint**: Foundation ready — `npm run lint`, `npx tsc --noEmit`, `npx prisma generate`, and unit tests all pass before user story implementation begins.

---

## Phase 3: User Story 1 — Define Project-Wide Architecture (Priority: P1) 🎯 MVP

**Goal**: Establish the layered Clean Architecture monorepo with dependency direction enforced by CI, and a working health endpoint proving the stack.

**Independent Test**: `GET /api/v1/health` returns 200 with valid JSON envelope; `npm run lint` proves Domain has no forbidden imports; architecture diagram in `docs/architecture/layers.md` is reviewed and accepted.

### Tests for User Story 1

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [x] T021 [P] [US1] Contract test for health endpoint response shape in `apps/api/tests/contract/health.contract.test.ts`
- [x] T022 [P] [US1] Integration test for `GET /api/v1/health` in `apps/api/tests/integration/health.integration.test.ts` asserting p95 <200 ms and database field in response
- [x] T023 [P] [US1] Unit test for `HealthCheckUseCase` in `apps/api/tests/unit/application/health/health-check.use-case.test.ts`
- [x] T024 [P] [US1] Static-analysis test that `packages/domain/src` has no forbidden imports (`@nestjs/*`, `@prisma/client`, `next`, `react`) in `packages/domain/tests/unit/import-lint.test.ts`

### Implementation for User Story 1

- [x] T025 [P] [US1] Define `HealthCheckUseCase` in `apps/api/src/application/health/health-check.use-case.ts`
- [x] T026 [P] [US1] Define `IHealthRepository` port in `packages/domain/src/ports/health-repository.port.ts`
- [x] T027 [P] [US1] Implement `PrismaHealthRepository` in `apps/api/src/infrastructure/prisma/repositories/prisma-health.repository.ts`
- [x] T028 [US1] Implement `HealthController` in `apps/api/src/modules/health/health.controller.ts` exposing `GET /api/v1/health`
- [x] T029 [US1] Wire `HealthModule` in `apps/api/src/modules/health/health.module.ts` with provider binding for `IHealthRepository`
- [x] T030 [P] [US1] Create architecture layer diagram and description in `docs/architecture/layers.md` showing Presentation → Application → Domain dependency direction and no Domain → Infrastructure imports
- [x] T031 [US1] Add ADR in `docs/architecture/adr-001-clean-architecture.md` documenting the layered structure decision and import enforcement strategy
- [x] T032 [P] [US1] Create frontend health page in `apps/web/src/app/health/page.tsx` that calls `GET /api/v1/health` and renders the status
- [x] T033 [US1] Create typed API client module `apps/web/src/lib/api-client.ts` with Zod-validated response parsing for the health endpoint

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently: `npm run lint`, `npm run test`, `npm run test:integration`, and the manual health page all pass.

---

## Phase 4: User Story 2 — Align Architecture with Legacy Database (Priority: P2)

**Goal**: Map the legacy MySQL `evaluateme` database to v3 entities, create new InnoDB tables for sessions/results, and provide an idempotent one-time migration job that preserves all legacy data.

**Independent Test**: Inspect `docs/architecture/legacy-database-mapping.md` and confirm every legacy table is listed as keep/map; run the idempotent migration against a local MySQL copy and verify v3 tables contain expected rows while legacy rows remain unchanged.

### Tests for User Story 2

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [x] T034 [P] [US2] Unit test for idempotent migration logic in `apps/api/tests/unit/infrastructure/migrations/legacy-sessions-migration.test.ts`
- [x] T035 [P] [US2] Integration test for migration job in `apps/api/tests/integration/migrations/legacy-data-migration.integration.test.ts` using a local MySQL copy, asserting no duplicate rows on re-run
- [x] T036 [P] [US2] Integration test verifying legacy `users` table gains v3 columns without data loss in `apps/api/tests/integration/migrations/users-columns.integration.test.ts`

### Implementation for User Story 2

- [x] T037 [P] [US2] Define domain entities in `packages/domain/src/entities/`: `user.entity.ts`, `company-profile.entity.ts`, `user-session.entity.ts`, `user-result.entity.ts`, `candidate-session.entity.ts`, `candidate-result.entity.ts` with lifecycle status enums
- [x] T038 [P] [US2] Define repository ports for legacy/v3 entities in `packages/domain/src/ports/`: `IUserSessionRepository.ts`, `IUserResultRepository.ts`, `ICandidateSessionRepository.ts`, `ICandidateResultRepository.ts`
- [x] T039 [US2] Update `packages/prisma/schema.prisma` to include legacy table references as read-only views or Prisma models (no destructive changes) and new v3 InnoDB tables for sessions/results
- [x] T040 [P] [US2] Create version-controlled Prisma migration in `packages/prisma/migrations/` adding new v3 session/result InnoDB tables with natural-key unique constraints (`sessionId`+`questionId`, `resultCode`)
- [x] T041 [P] [US2] Implement Prisma repositories in `apps/api/src/infrastructure/prisma/repositories/` for session/result entities (`PrismaUserSessionRepository`, `PrismaUserResultRepository`, `PrismaCandidateSessionRepository`, `PrismaCandidateResultRepository`)
- [x] T042 [US2] Implement one-time idempotent migration job in `apps/api/src/infrastructure/migrations/legacy-sessions-results.migration.ts` copying `Students`/`Results`/`Candidates`/`Candidates_results` into new v3 InnoDB tables using natural keys
- [x] T043 [US2] Implement one-time idempotent user/company migration in `apps/api/src/infrastructure/migrations/legacy-users-companies.migration.ts` unifying legacy `Users`/`Companies` into `users` + `company_profiles` while preserving original rows; use `IPasswordHasher` for any rehashed passwords
- [x] T043a [P] Define `IPasswordHasher` port in `packages/domain/src/ports/password-hasher.port.ts` and implement `BcryptPasswordHasher` in `apps/api/src/infrastructure/security/bcrypt-password-hasher.ts`; all new passwords MUST be hashed with bcrypt and legacy MD5 hashes MUST be invalidated after rehash on next login
- [x] T044 [P] [US2] Add migration runner CLI entrypoint in `apps/api/src/cli/run-migration.ts` accepting `--dry-run` and `--migration-name` flags
- [x] T045 [P] [US2] Create legacy database mapping document in `docs/architecture/legacy-database-mapping.md` with table-by-table v3 treatment and justification for any ignored/archive tables
- [x] T046 [US2] Add ADR in `docs/architecture/adr-002-legacy-database-strategy.md` documenting the decision to keep legacy MyISAM tables read-only and create new v3 InnoDB tables
- [x] T047 [US2] Add a migration safety check in `apps/api/src/infrastructure/migrations/migration-guard.ts` that refuses destructive operations unless `--force-destructive` is explicitly passed and logged

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently: legacy mapping is documented, migration is idempotent, and all foundation gates pass.

---

## Phase 5: User Story 3 — Establish Module Boundaries (Priority: P3)

**Goal**: Document the 13 backend modules and their responsibilities, and implement a minimal module boundary example (Technology catalog) that demonstrates how a feature fits into exactly one module with no circular dependencies.

**Independent Test**: Review `docs/architecture/modules.md` and verify each module has a single responsibility and cross-module dependencies are listed or forbidden; `GET /api/v1/technologies` returns a list using the module's own controller, application service, and repository.

### Tests for User Story 3

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [x] T048 [P] [US3] Contract test for `GET /api/v1/technologies` response shape in `apps/api/tests/contract/technologies.contract.test.ts`
- [x] T049 [P] [US3] Integration test for technology list endpoint in `apps/api/tests/integration/technologies/technologies.integration.test.ts`
- [x] T050 [P] [US3] Unit test for `ListTechnologiesUseCase` in `apps/api/tests/unit/application/technologies/list-technologies.use-case.test.ts`

### Implementation for User Story 3

- [x] T051 [P] [US3] Create module catalog document in `docs/architecture/modules.md` listing all 13 modules (`auth`, `users`, `companies`, `campaigns`, `technologies`, `tests`, `test-engine`, `access-codes`, `candidates`, `payments`, `results`, `admin`, `notifications`) with responsibilities and P1/P2 feature assignments from `.spec/spec.md`
- [x] T052 [US3] Add ADR in `docs/architecture/adr-003-module-boundaries.md` documenting module boundaries, forbidden circular dependencies, and integration-contract rules
- [x] T053 [P] [US3] Define `Technology` entity in `packages/domain/src/entities/technology.entity.ts`
- [x] T054 [P] [US3] Define `ITechnologyRepository` port in `packages/domain/src/ports/technology-repository.port.ts`
- [x] T055 [US3] Implement `ListTechnologiesUseCase` in `apps/api/src/application/technologies/list-technologies.use-case.ts`
- [x] T056 [US3] Implement `PrismaTechnologyRepository` in `apps/api/src/infrastructure/prisma/repositories/prisma-technology.repository.ts`
- [x] T057 [US3] Implement `TechnologiesController` in `apps/api/src/modules/technologies/technologies.controller.ts` exposing `GET /api/v1/technologies`
- [x] T058 [US3] Wire `TechnologiesModule` in `apps/api/src/modules/technologies/technologies.module.ts`
- [x] T059 [P] [US3] Add a dependency graph check script in `scripts/check-module-cycles.sh` using `madge` or custom parsing to reject circular module dependencies in CI
- [x] T060 [P] [US3] Create frontend technology listing page in `apps/web/src/app/technologies/page.tsx` consuming `GET /api/v1/technologies`

**Checkpoint**: All three user stories should now be independently functional: architecture layering is enforced, legacy database is mapped and migrated, and module boundaries are documented and demonstrated.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [x] T061 [P] Update `README.md` at repo root with project overview, tech stack, and link to `docs/architecture/`
- [x] T062 [P] Run `quickstart.md` validation steps manually and confirm all gates pass; update `quickstart.md` if any command changed
- [x] T063 [P] Add central error handling middleware in `apps/api/src/infrastructure/errors/error-handler.ts` mapping domain/application errors to the API response envelope defined in `contracts/api-conventions.md`
- [x] T064 [P] Add request validation interceptor in `apps/api/src/infrastructure/validation/zod-validation.pipe.ts` using Zod for input validation at controller boundaries
- [x] T065 [P] Add API versioning smoke test in `apps/api/tests/integration/api-versioning.integration.test.ts` asserting all registered routes start with `/api/v1`
- [x] T066 [P] Add performance smoke test in `apps/api/tests/integration/performance.integration.test.ts` asserting `GET /api/v1/health` p95 <200 ms over 100 requests
- [x] T067 [P] Refactor any direct Prisma/ORM usage spotted outside Infrastructure into repository implementations
- [x] T068 [P] Add `docs/architecture/decision-log.md` summarizing ADRs 001–003 and migration strategy
- [x] T069 [P] Run full CI simulation locally: `npm ci`, `npm run lint`, `npx tsc --noEmit`, `npx prisma generate`, `npm run test`, `npm run test:integration`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately.
- **Foundational (Phase 2)**: Depends on Setup completion — BLOCKS all user stories.
- **User Story 1 (Phase 3)**: Depends on Foundational phase. Can start immediately after foundation.
- **User Story 2 (Phase 4)**: Depends on Foundational phase. Can run in parallel with US1 after foundation.
- **User Story 3 (Phase 5)**: Depends on Foundational phase. Can run in parallel with US1 and US2 after foundation.
- **Polish (Phase 6)**: Depends on all desired user stories being complete.

### User Story Dependencies

- **User Story 1 (P1)**: No dependencies on other stories. Delivers the health endpoint and architecture layering proof.
- **User Story 2 (P2)**: No hard dependency on US1, but the migration runner may reuse the config/logger from Phase 2. Independently testable.
- **User Story 3 (P3)**: No hard dependency on US1 or US2, but it demonstrates module boundaries using the same Phase 2 infrastructure.

### Within Each User Story

- Tests (if included) MUST be written and FAIL before implementation.
- Domain ports/entities before application use cases.
- Application use cases before infrastructure repositories.
- Repositories before controllers.
- Story complete before moving to next priority.

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel.
- All Foundational tasks marked [P] can run in parallel (within Phase 2).
- Once Foundational phase completes, US1, US2, and US3 can proceed in parallel (if team capacity allows).
- All tests for a user story marked [P] can run in parallel.
- All models/entities within a story marked [P] can run in parallel.
- Different user stories can be worked on in parallel by different team members.

---

## Parallel Example: User Story 1

```bash
# Launch all tests for User Story 1 together:
Task: "Contract test for health endpoint response shape in apps/api/tests/contract/health.contract.test.ts"
Task: "Integration test for GET /api/v1/health in apps/api/tests/integration/health.integration.test.ts"
Task: "Unit test for HealthCheckUseCase in apps/api/tests/unit/application/health/health-check.use-case.test.ts"
Task: "Static-analysis test that packages/domain/src has no forbidden imports"

# Launch domain/application implementation together:
Task: "Define HealthCheckUseCase in apps/api/src/application/health/health-check.use-case.ts"
Task: "Define IHealthRepository port in packages/domain/src/ports/health-repository.port.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL — blocks all stories)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: `npm run lint`, `npx tsc --noEmit`, health integration test, and architecture import lint all pass.
5. Deploy/demo the health endpoint if ready.

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready.
2. Add User Story 1 → Test independently → Deploy/Demo (MVP: architecture layering is proven).
3. Add User Story 2 → Test independently → Confirm legacy mapping + idempotent migration works.
4. Add User Story 3 → Test independently → Confirm module boundaries are documented and demonstrated.
5. Complete Phase 6: Polish → Full CI simulation passes.

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together.
2. Once Foundational is done:
   - Developer A: User Story 1 (health endpoint + architecture proof)
   - Developer B: User Story 2 (legacy database mapping + migration)
   - Developer C: User Story 3 (module catalog + technology example)
3. Stories complete and integrate independently.
4. Team reconvenes for Phase 6: Polish and full CI simulation.

---

## Notes

- [P] tasks = different files, no dependencies.
- [Story] label maps task to specific user story for traceability.
- Each user story should be independently completable and testable.
- Verify tests fail before implementing.
- Commit after each task or logical group.
- Stop at any checkpoint to validate a story independently.
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence.
