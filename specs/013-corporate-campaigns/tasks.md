# Tasks: Corporate Campaigns Management

**Input**: Design documents from `/specs/013-corporate-campaigns/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md

**Organization**: Tasks are grouped by user story to enable independent implementation and testing. No explicit TDD requirement is in the spec; tests are included as a separate Polish phase covering API and smoke tests rather than per-task unit tests.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Dependency Order

```
Phase 1 (Setup)
    ↓
Phase 2 (Foundational Schema)
    ↓
Phase 3 (US1 — Campaigns CRUD + history)
    ↓
Phase 4 (US3 — Custom/Personal quizzes)  ← can run in parallel with Phase 3 once Phase 2 is done
    ↓
Phase 5 (US2 — Access codes)             ← depends on US1 (campaign status) and US3 (quiz selection)
    ↓
Phase 6 (US4 — Results)                  ← depends on US2 (access code)
    ↓
Phase 7 (US5 — Audit log polish)         ← extends US1 history
    ↓
Phase 8 (Polish, integration, tests)
```

## Parallel Execution Examples

- **Within Phase 3 (US1)**: T007, T008, T009, T010 can run in parallel because backend use case, repository, controller, and frontend page touch different files.
- **Within Phase 4 (US3)**: T012/T013 (backend) and T015/T016 (frontend) can run in parallel.
- **Phase 3 and Phase 4 can overlap** after Phase 2 is complete, but phase ordering is recommended for clarity.

## Implementation Strategy

Deliver the feature as an incremental MVP:

1. **MVP scope**: Phase 1–3 (Campaigns CRUD + history). A company administrator can create and manage campaigns without any other corporate feature.
2. **Second slice**: Phase 4 (Custom/personal quizzes). Adds private company quizzes.
3. **Third slice**: Phase 5 (Access codes). Connects campaigns and quizzes to candidates.
4. **Fourth slice**: Phase 6 (Results). Completes the core business value loop.
5. **Fifth slice**: Phase 7 (Audit log polish) + Phase 8 (integration, tests, documentation).

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Add the new corporate backend module and frontend page roots, and wire the module into the API.

- [x] T001 Create `apps/api/src/modules/corporate/corporate.module.ts` and register it in `apps/api/src/app.module.ts`
- [x] T002 [P] Create frontend page root directories: `apps/web/src/app/campaigns/`, `apps/web/src/app/quizzes/custom/`, `apps/web/src/app/quizzes/personal/`, and `apps/web/src/components/campaigns/`, `apps/web/src/components/quizzes/`

---

## Phase 2: Foundational (Blocking Schema)

**Purpose**: Apply the Prisma migration and domain ports that every later phase depends on.

- [x] T003 Create Prisma migration `packages/prisma/migrations/20260905_corporate_campaigns/migration.sql` adding `companyId`/`notes` to `campaigns`, `campaignId`/`sentAt`/`sentToEmail`/`usedCount`/`maxUses` to `access_codes`, new `company_quizzes`, `custom_quiz_questions`, `company_quiz_questions`, `company_quiz_answers` tables, and `campaignId`/`accessCodeId`/`companyQuizId` to `candidate_results`
- [x] T004 Regenerate Prisma client and update `packages/prisma/schema.prisma` to match the migration in `specs/013-corporate-campaigns/data-model.md`
- [x] T005 [P] Define domain repository ports in `packages/domain/src/repositories/corporate/` for `ICampaignRepository`, `ICompanyQuizRepository`, and `IAccessCodeRepository`
- [x] T006 Create empty Prisma repository stubs: `apps/api/src/infrastructure/prisma/repositories/prisma-campaign.repository.ts`, `prisma-company-quiz.repository.ts`, `prisma-access-code.repository.ts`

---

## Phase 3: User Story 1 — Campaigns CRUD + History

**Goal**: A company administrator can create, list, filter, update status, and view history for campaigns.

**Independent Test**: Log in as a company user, create a campaign, change its status, and verify the history entries.

- [x] T007 [P] [US1] Implement `CreateCampaignUseCase` in `apps/api/src/application/corporate/campaigns/create-campaign.use-case.ts`
- [x] T008 [P] [US1] Implement `ListCampaignsUseCase` (filter by status, scoped by company) in `apps/api/src/application/corporate/campaigns/list-campaigns.use-case.ts`
- [x] T009 [P] [US1] Implement `UpdateCampaignStatusUseCase` with status-machine validation in `apps/api/src/application/corporate/campaigns/update-campaign-status.use-case.ts`
- [x] T010 [P] [US1] Implement `GetCampaignUseCase` with history in `apps/api/src/application/corporate/campaigns/get-campaign.use-case.ts`
- [x] T011 [US1] Implement `CampaignsController` in `apps/api/src/modules/corporate/campaigns.controller.ts` exposing `POST /api/v1/corporate/campaigns`, `GET /api/v1/corporate/campaigns`, `PATCH /api/v1/corporate/campaigns/:id/status`, `GET /api/v1/corporate/campaigns/:id`
- [x] T012 [P] [US1] Implement `PrismaCampaignRepository` in `apps/api/src/infrastructure/prisma/repositories/prisma-campaign.repository.ts`
- [x] T013 [P] [US1] Build campaign list page `apps/web/src/app/campaigns/page.tsx`
- [x] T014 [P] [US1] Build campaign detail/status/history page `apps/web/src/app/campaigns/[id]/page.tsx` and `CampaignHistory` component in `apps/web/src/components/campaigns/CampaignHistory.tsx`
- [x] T015 [US1] Add Zod schemas for campaign requests in `apps/api/src/lib/schemas/corporate.schema.ts`

---

## Phase 4: User Story 3 — Custom/Personal Company Quizzes

**Goal**: A company administrator can build private custom quizzes from existing questions and personal quizzes with original questions.

**Independent Test**: Create a custom quiz by selecting existing questions and a personal quiz by adding new Q&A; confirm both are invisible to another company.

- [x] T016 [P] [US3] Implement `CreateCustomQuizUseCase` in `apps/api/src/application/corporate/quizzes/create-custom-quiz.use-case.ts`
- [x] T017 [P] [US3] Implement `CreatePersonalQuizUseCase` in `apps/api/src/application/corporate/quizzes/create-personal-quiz.use-case.ts`
- [x] T018 [P] [US3] Implement `ListCompanyQuizzesUseCase` (scoped by company, typed) in `apps/api/src/application/corporate/quizzes/list-company-quizzes.use-case.ts`
- [x] T019 [US3] Implement `QuizzesController` in `apps/api/src/modules/corporate/quizzes.controller.ts` exposing `POST /api/v1/corporate/quizzes`, `GET /api/v1/corporate/quizzes`
- [x] T020 [P] [US3] Implement `PrismaCompanyQuizRepository` in `apps/api/src/infrastructure/prisma/repositories/prisma-company-quiz.repository.ts`
- [x] T021 [P] [US3] Build custom quiz builder page `apps/web/src/app/quizzes/custom/page.tsx` and `CustomQuizBuilder` component
- [x] T022 [P] [US3] Build personal quiz builder page `apps/web/src/app/quizzes/personal/page.tsx` and `PersonalQuizBuilder` component
- [x] T023 [US3] Extend `corporate.schema.ts` with create-quiz schemas

---

## Phase 5: User Story 2 — Access Codes Inside a Campaign

**Goal**: A company administrator can create, view, and email access codes for a quiz within an open campaign; limits are enforced.

**Independent Test**: Open a campaign, create an access code for a company quiz, email it, and see it marked as sent; verify codes cannot be created in a closed campaign.

- [x] T024 [P] [US2] Implement `CreateAccessCodeUseCase` (only open campaigns, respect company limit, decrement `CompanyProfile.availableAccessCodes`) in `apps/api/src/application/corporate/access-codes/create-access-code.use-case.ts`
- [x] T025 [P] [US2] Implement `ListAccessCodesUseCase` (filter by campaign) in `apps/api/src/application/corporate/access-codes/list-access-codes.use-case.ts`
- [x] T026 [P] [US2] Implement `SendAccessCodeUseCase` (email + `sentAt`/`sentToEmail`) in `apps/api/src/application/corporate/access-codes/send-access-code.use-case.ts`
- [x] T027 [US2] Implement `AccessCodesController` in `apps/api/src/modules/corporate/access-codes.controller.ts` exposing `POST /api/v1/corporate/campaigns/:campaignId/access-codes`, `GET /api/v1/corporate/campaigns/:campaignId/access-codes`, `POST /api/v1/corporate/access-codes/:id/send`
- [x] T028 [P] [US2] Implement `PrismaAccessCodeRepository` in `apps/api/src/infrastructure/prisma/repositories/prisma-access-code.repository.ts`
- [x] T029 [P] [US2] Build access-code grid on campaign detail: `AccessCodeGrid` and `CreateAccessCodeForm` components in `apps/web/src/components/campaigns/`
- [x] T030 [US2] Extend `corporate.schema.ts` with access-code schemas

---

## Phase 6: User Story 4 — Candidate Results Within a Campaign

**Goal**: A company administrator can view candidate test results scoped to a campaign and see a detailed breakdown with per-question correctness and a chart.

**Independent Test**: Complete a test using a campaign access code; as admin, open the campaign results, click the result, and verify question breakdown + chart.

- [x] T031 [P] [US4] Update test-engine flow to record `campaignId`, `accessCodeId`, and `companyQuizId` on `CandidateResult` when a test is started with an access code (modify `apps/api/src/application/test-engine/start-session.use-case.ts` or related use case)
- [x] T032 [P] [US4] Implement `ListCampaignResultsUseCase` in `apps/api/src/application/corporate/results/list-campaign-results.use-case.ts`
- [x] T033 [P] [US4] Implement `GetCandidateResultDetailUseCase` (per-question correctness + summary) in `apps/api/src/application/corporate/results/get-candidate-result-detail.use-case.ts`
- [x] T034 [US4] Implement `ResultsController` in `apps/api/src/modules/corporate/results.controller.ts` exposing `GET /api/v1/corporate/campaigns/:campaignId/results`, `GET /api/v1/corporate/results/:id`
- [x] T035 [P] [US4] Build campaign results list: `CampaignResults` component and route `apps/web/src/app/campaigns/[id]/results/page.tsx`
- [x] T036 [P] [US4] Build result detail page with chart: `ResultDetail` + `ResultChart` components and route `apps/web/src/app/campaigns/[id]/results/[resultId]/page.tsx`
- [x] T037 [US4] Extend `corporate.schema.ts` with result-related DTOs if needed

---

## Phase 7: User Story 5 — Audit Log Polish

**Goal**: Campaign history records creation, status changes, and access code creation with timestamps and usernames.

**Independent Test**: Create a campaign, change status, create an access code, and verify all actions appear in the campaign history.

- [x] T038 [US5] Extend `CampaignHistory` recording in all campaign and access-code use cases to log `access_code_created` actions in `apps/api/src/application/corporate/campaigns/*-campaign.use-case.ts` and `apps/api/src/application/corporate/access-codes/*-access-code.use-case.ts`
- [x] T039 [P] [US5] Update `CampaignHistory` UI component to render action type and optional metadata in `apps/web/src/components/campaigns/CampaignHistory.tsx`
- [x] T040 [US5] Add API contract for campaign history in `specs/013-corporate-campaigns/contracts/campaign-history.json`

---

## Phase 8: Polish, Integration, Tests, Documentation

**Purpose**: Cross-cutting concerns, verify builds and tests, update docs.

- [x] T041 Add API contracts for all new endpoints under `specs/013-corporate-campaigns/contracts/`
- [x] T042 [P] Add API tests for corporate endpoints in `apps/api/tests/api/corporate/`
- [x] T043 [P] Add a seed company test user and sample data script (or extend existing scripts) for local smoke testing
- [x] T044 Run `npm run typecheck`, `npm run lint`, `npm run test -w apps/api`, `npm run build -w apps/api -w apps/web`; fix any failures
- [x] T045 Update `CHANGELOG.md` and `docs/SESSION-LOG.md` with corporate campaigns feature summary
- [x] T046 Update `specs/013-corporate-campaigns/quickstart.md` with final test-account credentials and endpoint examples after implementation

---

## Summary

- **Total tasks**: 46
- **MVP scope**: T001–T015 (Phase 1–3, US1) — full campaign CRUD + history.
- **Tasks per user story**: US1: 9, US3: 8, US2: 7, US4: 7, US5: 3.
- **Polish/Integration**: 6 tasks.
