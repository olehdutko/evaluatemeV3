# Tasks: Shared Data Model

**Input**: Design documents from `/specs/002-02-data-model/`

**Prerequisites**: spec.md (required), data-model.md from `specs/001-01-architecture/`

**Tests**: Executable gates are required because the data model is shared by all later features.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)

---

## Phase 1: Domain Entities & Ports (US1)

**Purpose**: Establish the shared TypeScript vocabulary for all v3 features.

### Tests

- [x] T001 [P] [US1] Unit test for `User` entity construction and validation rules in `packages/domain/tests/unit/entities/user.entity.test.ts`
- [x] T002 [P] [US1] Unit test for `CompanyProfile` entity in `packages/domain/tests/unit/entities/company-profile.entity.test.ts`
- [x] T003 [P] [US1] Unit test for `Campaign` and `CampaignHistory` entities in `packages/domain/tests/unit/entities/campaign.entity.test.ts`
- [x] T004 [P] [US1] Unit test for `Test`, `Question`, `Answer`, and `FreeSampleQuestion` entities in `packages/domain/tests/unit/entities/test-question-answer.entity.test.ts`
- [x] T005 [P] [US1] Unit test for `AccessCode`, `Order`, `EmailTemplate`, `LandingAd`, and `CreditSetting` entities in `packages/domain/tests/unit/entities/supporting-entities.entity.test.ts`
- [x] T006 [P] [US1] Static test that all repository ports are exported from `packages/domain/src/index.ts` in `packages/domain/tests/unit/ports-export.test.ts`

### Implementation

- [x] T007 [P] [US1] Define `User` entity in `packages/domain/src/entities/user.entity.ts`
- [x] T008 [P] [US1] Define `CompanyProfile` entity in `packages/domain/src/entities/company-profile.entity.ts`
- [x] T009 [P] [US1] Define `Campaign` and `CampaignHistory` entities in `packages/domain/src/entities/campaign.entity.ts`
- [x] T010 [P] [US1] Define `Test`, `Question`, `Answer`, and `FreeSampleQuestion` entities in `packages/domain/src/entities/test.entity.ts` and `packages/domain/src/entities/question.entity.ts`
- [x] T011 [P] [US1] Define `AccessCode`, `Order`, `EmailTemplate`, `LandingAd`, and `CreditSetting` entities in `packages/domain/src/entities/supporting.entity.ts`
- [x] T012 [P] [US1] Define repository ports for all entities in `packages/domain/src/ports/` (e.g., `ICompanyProfileRepository.ts`, `ICampaignRepository.ts`, `ITestRepository.ts`, `IQuestionRepository.ts`, `IAnswerRepository.ts`, `IAccessCodeRepository.ts`, `IOrderRepository.ts`)
- [x] T013 [P] [US1] Update `packages/domain/src/index.ts` barrel export to include new entities and ports
- [x] T014 [P] [US1] Define shared status/role enums in `packages/domain/src/entities/enums.ts` if not already present

**Checkpoint**: `npm run lint` and `npm run test` pass for `packages/domain`.

---

## Phase 2: Prisma Schema Alignment & Migration (US2)

**Purpose**: Align the physical MySQL schema with the domain model using non-destructive migrations.

### Tests

- [x] T015 [P] [US2] Integration test in `packages/prisma/tests/integration/schema-migration.integration.test.ts` asserting the migration adds v3 tables without destructive changes
- [x] T016 [P] [US2] Unit test in `packages/prisma/tests/unit/schema-coverage.test.ts` asserting every v3 entity has a corresponding Prisma model

### Implementation

- [x] T017 [P] [US2] Review and align `packages/prisma/schema.prisma` with all entities from US1 (status enums as `String` with validation in domain)
- [x] T018 [P] [US2] Add natural-key unique constraints (`Test` per `technologyId`+`title`, `Question` per `testId`+`orderIndex`, `Answer` per `questionId`+`orderIndex`) where domain requires
- [x] T019 [P] [US2] Create version-controlled migration in `packages/prisma/migrations/` adding missing v3 tables and unique constraints without altering legacy tables
- [x] T020 [US2] Update migration runner safety documentation in `docs/architecture/legacy-database-mapping.md` to reflect current schema

**Checkpoint**: `npm run db:generate` succeeds and `npx prisma migrate status` shows a clean pending migration against a local MySQL copy.

---

## Phase 3: Legacy Read-Only Reference Models (US3)

**Purpose**: Allow the migration runner to read legacy tables safely.

### Tests

- [x] T021 [P] [US3] Unit test in `packages/prisma/tests/unit/legacy-readonly.test.ts` asserting legacy models have no `@@id` or writable operations in generated Prisma client metadata
- [x] T022 [P] [US3] Integration test in `apps/api/tests/integration/migrations/legacy-readonly-read.integration.test.ts` reading a row from each legacy table without writing

### Implementation

- [x] T023 [P] [US3] Add read-only Prisma models for legacy tables (`LegacyUser`, `LegacyCompany`, `LegacyStudent`, `LegacyResult`, `LegacyCandidate`, `LegacyCandidateResult`) with `@@map("...")`
- [x] T024 [P] [US3] Mark legacy models as read-only in code comments and exclude them from future writes by convention
- [x] T025 [P] [US3] Update `docs/architecture/legacy-database-mapping.md` with the exact legacy model names and read-only rule

**Checkpoint**: Integration tests can read legacy tables and `npm run lint` still passes.

---

## Dependencies & Execution Order

- Phase 1 (US1) can start immediately and is required by Phases 2 and 3.
- Phase 2 (US2) depends on Phase 1 entity definitions.
- Phase 3 (US3) depends on Phase 2 Prisma client generation.
- All [P] tasks within a phase can run in parallel.

## Notes

- Domain entities must remain pure TypeScript with no framework imports.
- Prisma models may use `String` for status fields; domain layer validates enum values.
- No destructive changes to legacy tables.
- Commit after each phase.
