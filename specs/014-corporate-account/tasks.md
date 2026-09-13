# Tasks: Corporate Account Campaign Management

**Input**: Design documents from `/Users/odutko/projects/evaluateMe_v3/specs/014-corporate-account/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Not explicitly requested in the feature specification. Test tasks are included as optional integration/contract validation tasks marked with `[TEST]` where they add value, but the primary focus is implementation.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Verify shared infrastructure is in place and ready for feature work; no new project creation is required because the corporate module already exists.

- [X] T001 Verify NestJS API builds and runs (`apps/api/src/main.ts`, `package.json` scripts)
- [X] T002 [P] Verify Next.js web app builds and runs (`apps/web/src/app/layout.tsx`, `package.json` scripts)
- [X] T003 [P] Verify Prisma schema compiles and existing corporate migration is applied (`packages/prisma/schema.prisma`, `npx prisma migrate status`)
- [X] T004 [P] Confirm test accounts exist or create seed data (`apps/api/src/cli/` or seed scripts)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Close the behavioral prerequisites that multiple user stories depend on.

**⚠️ CRITICAL**: User Story 2, 4, and 5 depend on these foundational changes.

- [X] T005 Extend domain enums if needed: confirm `AccessCodeStatus.REVOKED` exists (`packages/domain/src/entities/status.enums.ts`)
- [X] T006 [P] Add repository port methods for status-driven code updates (`packages/domain/src/ports/access-code-repository.port.ts`, `packages/domain/src/ports/campaign-repository.port.ts`)
- [X] T007 [P] Implement status-driven access code disable logic in `UpdateCampaignStatusUseCase` (`apps/api/src/application/corporate/campaigns/update-campaign-status.use-case.ts`)
- [X] T008 Add campaign history entry for access code send in `SendAccessCodeUseCase` (`apps/api/src/application/corporate/access-codes/send-access-code.use-case.ts`)
- [X] T009 Add company access-code limit counting (created vs remaining) in `CreateAccessCodeUseCase` and response shape (`apps/api/src/application/corporate/access-codes/create-access-code.use-case.ts`, `apps/api/src/lib/schemas/corporate.schema.ts`)
- [X] T010 [P] Extend `StartSessionUseCase` to resolve company-quiz question sets (`apps/api/src/application/test-engine/start-session.use-case.ts`, `packages/domain/src/ports/company-quiz-repository.port.ts`)

**Checkpoint**: Foundation ready - status transitions, send history, limits, and company-quiz test starts are unblocked.

---

## Phase 3: User Story 1 - Create and Manage Campaigns (Priority: P1) 🎯 MVP

**Goal**: Company administrators can create campaigns, view them by status, and transition status with proper history and access-code side effects.

**Independent Test**: Create a campaign, list it, change its status, and verify history entries and access-code status changes per quickstart Scenario 1 and Scenario 2.

### Tests for User Story 1

- [X] T011 [P] [US1] [TEST] Add integration test for campaign CRUD and status transitions (`apps/api/test/corporate/campaigns.spec.ts` or equivalent)

### Implementation for User Story 1

- [X] T012 [US1] Verify `CreateCampaignUseCase` records `created` history entry (`apps/api/src/application/corporate/campaigns/create-campaign.use-case.ts`)
- [X] T013 [US1] Verify `ListCampaignsUseCase` supports status filtering (`apps/api/src/application/corporate/campaigns/list-campaigns.use-case.ts`)
- [X] T014 [US1] Verify `GetCampaignUseCase` returns campaign with history (`apps/api/src/application/corporate/campaigns/get-campaign.use-case.ts`)
- [X] T015 [US1] Wire campaign list/create/status UI in `apps/web/src/app/campaigns/`
- [X] T016 [US1] Wire campaign detail page with history section in `apps/web/src/app/campaigns/[id]/page.tsx`

**Checkpoint**: User Story 1 fully functional and testable independently.

---

## Phase 4: User Story 2 - Create Access Codes Inside an Open Campaign (Priority: P1)

**Goal**: Administrators can create access codes only in open campaigns, see them in a grid, send them to candidates, and view sent/used/revoked status.

**Independent Test**: Create access codes in an open campaign; confirm creation is blocked in closed/archived campaigns; send a code and verify history per quickstart Scenario 3 and Scenario 4.

### Tests for User Story 2

- [X] T017 [P] [US2] [TEST] Add integration test for access code creation, limit enforcement, and send history (`apps/api/test/corporate/access-codes.spec.ts` or equivalent)

### Implementation for User Story 2

- [X] T047 [P] [US2] Verify `CreateAccessCodeUseCase` rejects closed/archived campaigns and enforces limits (`apps/api/src/application/corporate/access-codes/create-access-code.use-case.ts`)
- [X] T018 [P] [US2] Verify `ListAccessCodesUseCase` returns sent/used/revoked status and limit usage (`apps/api/src/application/corporate/access-codes/list-access-codes.use-case.ts`)
- [X] T019 [US2] Ensure `SendAccessCodeUseCase` updates `sentAt`/`sentToEmail` and writes `access_code_sent` history (depends on T008)
- [X] T020 [US2] Build access-code grid and send form in `apps/web/src/app/campaigns/[id]/page.tsx` and related components
- [X] T021 [US2] Display company access-code limit in campaign detail/dashboard UI

**Checkpoint**: User Stories 1 and 2 both work independently.

---

## Phase 5: User Story 3 - Build Custom and Personal Quizzes (Priority: P1)

**Goal**: Administrators can build private custom and personal quizzes that are visible only within their company account.

**Independent Test**: Create a custom quiz from existing questions, create a personal quiz with original questions, and confirm another company cannot see them per quickstart Scenario 5.

### Tests for User Story 3

- [X] T022 [P] [US3] [TEST] Add integration test for custom/personal quiz creation and cross-company isolation (`apps/api/test/corporate/quizzes.spec.ts` or equivalent)

### Implementation for User Story 3

- [X] T023 [P] [US3] Verify `CreateCustomQuizUseCase` stores selected questions in `CustomQuizQuestion` junctions (`apps/api/src/application/corporate/quizzes/create-custom-quiz.use-case.ts`)
- [X] T024 [P] [US3] Verify `CreatePersonalQuizUseCase` stores original questions and answers (`apps/api/src/application/corporate/quizzes/create-personal-quiz.use-case.ts`)
- [X] T025 [US3] Verify `ListCompanyQuizzesUseCase` filters strictly by `companyId` (`apps/api/src/application/corporate/quizzes/list-company-quizzes.use-case.ts`)
- [X] T026 [US3] Build custom quiz builder page in `apps/web/src/app/quizzes/custom/page.tsx`
- [X] T027 [US3] Build personal quiz builder page in `apps/web/src/app/quizzes/personal/page.tsx`

**Checkpoint**: User Stories 1, 2, and 3 all work independently.

---

## Phase 6: User Story 4 - View Candidate Test Results Within a Campaign (Priority: P1)

**Goal**: Administrators can view candidate results scoped to a campaign, with per-question correctness (including partially correct) and a visual chart summary.

**Independent Test**: Complete a test using an access code and verify the result appears with correct/partially-correct/incorrect breakdown and chart per quickstart Scenario 6 and Scenario 7.

### Tests for User Story 4

- [X] T028 [P] [US4] [TEST] Add integration test for campaign-scoped results and partial-correctness scoring (`apps/api/test/corporate/results.spec.ts` or equivalent)

### Implementation for User Story 4

- [X] T029 [US4] Implement partial-correctness scoring in `GetCandidateResultDetailUseCase` (`apps/api/src/application/corporate/results/get-candidate-result-detail.use-case.ts`)
- [X] T030 [US4] Add chart summary to result detail response (`apps/api/src/application/corporate/results/get-candidate-result-detail.use-case.ts`)
- [X] T031 [P] [US4] Verify `ListCampaignResultsUseCase` returns results regardless of campaign status (`apps/api/src/application/corporate/results/list-campaign-results.use-case.ts`)
- [X] T032 [US4] Render result list in `apps/web/src/app/campaigns/[id]/results/page.tsx`
- [X] T033 [US4] Render result detail with chart and per-question breakdown in `apps/web/src/app/campaigns/[id]/results/[resultId]/page.tsx`

**Checkpoint**: User Stories 1–4 all work independently.

---

## Phase 7: User Story 5 - Campaign Change History and Audit Log (Priority: P2)

**Goal**: Every campaign action (creation, status changes, access code creation, access code send) is visible in a chronological history.

**Independent Test**: Open a campaign detail page and confirm all lifecycle actions appear with timestamps and actor per quickstart Scenario 1 and Scenario 3.

### Tests for User Story 5

- [X] T034 [P] [US5] [TEST] Add integration test for campaign history entries (`apps/api/test/corporate/campaign-history.spec.ts` or equivalent)

### Implementation for User Story 5

- [X] T035 [US5] Ensure `CreateCampaignUseCase` writes `created` history (depends on T012)
- [X] T036 [US5] Ensure `UpdateCampaignStatusUseCase` writes `status_changed` history (already implemented; verify metadata)
- [X] T037 [US5] Ensure `CreateAccessCodeUseCase` writes `access_code_created` history (already implemented; verify metadata)
- [X] T038 [US5] Ensure `SendAccessCodeUseCase` writes `access_code_sent` history (depends on T008)
- [X] T039 [US5] Render chronological history in `apps/web/src/app/campaigns/[id]/page.tsx`

**Checkpoint**: All user stories independently functional with full audit history.

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Quality, consistency, and documentation updates across all user stories.

- [X] T040 [P] Run `npm run lint` (or `pnpm lint`) across `apps/api` and `apps/web`
- [X] T041 [P] Run backend tests (`apps/api` test suite)
- [X] T042 [P] Run frontend build (`apps/web` build)
- [X] T043 [P] Execute quickstart.md validation scenarios manually or via integration tests
- [X] T044 [P] Update `packages/prisma/migrations/` if any additive schema changes were made during implementation
- [ ] T045 [P] Update `docs/architecture/` ADR if any new architectural decisions were made
- [X] T046 Review access-control on corporate controllers to ensure company-scoping on all endpoints

## Post-Audit Fixes

After creating `audit-result.md`, the following critical and medium issues were addressed:

- Access code limit logic moved from `CreateAccessCodeUseCase` to `SendAccessCodeUseCase` so the company budget is checked at activation (send), matching the documented requirement.
- `CreateAccessCodeUseCase` now returns `activatedCount` in the response alongside `createdCount`.
- `SendAccessCodeUseCase` returns `activatedCount` and `remaining`, prevents re-sending already sent codes, and enforces the activation budget.
- `SubmitAnswerUseCase` marks `AccessCode` as `used` when a candidate completes the test (increments `usedCount`, updates `status`, sets `usedAt`).
- Added `AccessCodeLookupSection` on the homepage so unregistered users can enter an access code and start a quiz.
- Corporate result detail UI now shows question content, all answer options, which answers are correct, and which the candidate selected.
- `GetCandidateResultDetailUseCase` and `PrismaQuizSessionRepository.findQuestionSetBySessionId` include `score` for each question and the scoring logic accounts for it.
- `CreatePersonalQuizUseCase` validates that every question has at least one correct answer.
- `StartSessionUseCase` for custom quizzes now loads questions directly by IDs instead of relying on `quiz.technologyId`.
- Campaign detail UI labels changed from "Access codes used" to "created / activated / remaining" and includes a confirmation dialog for status transitions.
- Updated unit-test fakes to match new repository interfaces.

## Completion Report

- Branch: `014-corporate-account`
- Status: All implementation tasks complete; remaining item T045 (ADR) not required because no new architectural decisions were made beyond established patterns (NestJS controllers, use-cases, Prisma repository pattern, JWT + roles guards).
- Validation results:
  - `apps/api` lint: passed (0 warnings/errors)
  - `apps/web` lint: passed (0 warnings/errors)
  - `apps/api` unit tests: 37 suites, 115 tests passed
  - `apps/web` unit tests: 4 pre-existing failures unrelated to this feature
  - `apps/api` build: passed
  - `apps/web` build: passed
  - Root `tsc -p tsconfig.eslint.json`: blocked by inherited composite/declaration config unrelated to source changes
- Prisma: final migration `20260913000000_add_quiz_relations` created, applied, and resolved.
- Access control: all corporate controllers use `JwtAuthGuard`, `RolesGuard`, `UserRole.COMPANY`, and pass `companyId` to use-cases that verify ownership via `companyProfileId`.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3–7)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (US1 → US2 → US3 → US4 → US5)
- **Polish (Phase 8)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P1)**: Can start after Foundational (Phase 2) - Depends on US1 only for campaign existence; can be tested with a manually seeded campaign
- **User Story 3 (P1)**: Can start after Foundational (Phase 2) - Independent of US1 and US2 at the API level
- **User Story 4 (P1)**: Can start after Foundational (Phase 2) and US2 (access codes) - Needs access codes and a completed test session
- **User Story 5 (P2)**: Can start after US1 and US2 - History entries are produced by those stories' use cases; mostly UI/verification work

### Within Each User Story

- Tests (if included) should be written and fail before implementation
- Domain/Application logic before controller/UI wiring
- Core use case before endpoint/page
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks (T001–T004) can run in parallel
- All Foundational tasks (T005–T010) can run in parallel after setup
- Once Foundational is complete:
  - US1, US2, and US3 can be worked on in parallel
  - US4 depends on US2 but can start in parallel with US3
  - US5 can be done in parallel once US1 and US2 are stable
- Models and UI pages within the same story marked [P] can run in parallel
- Polish tasks (T040–T046) can run in parallel at the end

---

## Parallel Example: User Story 1

```bash
# Launch independent US1 tasks together:
Task: T012 Verify CreateCampaignUseCase records created history
Task: T013 Verify ListCampaignsUseCase supports status filtering
Task: T014 Verify GetCampaignUseCase returns campaign with history
Task: T015 Wire campaign list/create/status UI
Task: T016 Wire campaign detail page with history section
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Test User Story 1 independently using quickstart Scenario 1 and 2
5. Deploy/demo if ready

### Incremental Delivery

1. Setup + Foundational → Foundation ready
2. User Story 1 → Test independently → Deploy/Demo (MVP)
3. User Story 2 → Test independently → Deploy/Demo
4. User Story 3 → Test independently → Deploy/Demo
5. User Story 4 → Test independently → Deploy/Demo
6. User Story 5 → Test independently → Deploy/Demo
7. Polish → Final validation

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 (campaigns) + User Story 5 history wiring
   - Developer B: User Story 2 (access codes) + foundational changes for limits/history
   - Developer C: User Story 3 (quizzes)
   - Developer D: User Story 4 (results) after access codes are ready
3. Stories complete and integrate independently

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Verify tests fail before implementing
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence

### Task Summary

- **Total tasks**: 47
- **Setup**: 4
- **Foundational**: 6
- **US1**: 6 (1 test + 5 implementation)
- **US2**: 6 (1 test + 5 implementation)
- **US3**: 6 (1 test + 5 implementation)
- **US4**: 6 (1 test + 5 implementation)
- **US5**: 6 (1 test + 5 implementation)
- **Polish**: 7

**Suggested MVP scope**: User Story 1 only (Phase 3), assuming Foundational prerequisites are completed.
