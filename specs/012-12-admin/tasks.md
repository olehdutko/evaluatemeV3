# Tasks: Admin Panel

**Input**: Design documents from `/specs/012-12-admin/`

**Prerequisites**: `005-05-auth`, `006-06-security`, `008-08-test-engine`, `009-09-testing`

**Tests**: Unit, contract, and integration tests required for all new endpoints and pages.

## Phase 1: Admin Foundation

- [ ] T001 [P] [US1] Add `admin-login` endpoint that rejects non-admins and rejects admin on standard login
- [ ] T002 [P] [US1] Update frontend API client to call `/api/v1/auth/admin-login`
- [ ] T003 [P] [US1] Create hidden `/admin/login` page with distinct route
- [ ] T004 [P] [US1] Update standard `/login` to show forbidden error for admin emails
- [ ] T005 [P] [US2] Create admin layout `/app/admin/layout.tsx` with role guard
- [ ] T006 [P] [US2] Create `/admin/dashboard` with navigation cards
- [ ] T007 [P] [US2] Update middleware to protect `/admin/*` routes by role
- [ ] T008 [P] [US1, US2] Add integration/contract tests for admin login and access control

## Phase 2: Technology Pricing and Credit Settings

- [ ] T009 [P] [US3] Add `isFree` and `creditCost` columns to `Technology` schema and migration
- [ ] T010 [P] [US3] Create admin `PUT /api/v1/admin/technologies/:id/pricing` endpoint
- [ ] T011 [P] [US3] Create `/admin/pricing` page listing technologies with free/paid toggle and credit cost input
- [ ] T012 [P] [US4] Create `GET /api/v1/admin/credit-settings` and `PUT /api/v1/admin/credit-settings` endpoints
- [ ] T013 [P] [US4] Create `/admin/credit-settings` page for global prices and default free credits
- [ ] T014 [P] [US4] Create `PATCH /api/v1/admin/companies/:id/bonus` endpoint for per-company credits/access codes
- [ ] T015 [P] [US4] Add company bonus controls on `/admin/users` company tab
- [ ] T016 [P] [US3, US4] Add contract and integration tests for pricing and credit settings

## Phase 3: Email Templates and Landing Ads

- [ ] T017 [P2] [US5] Create `GET /api/v1/admin/email-templates` and `PUT /api/v1/admin/email-templates/:name` endpoints
- [ ] T018 [P2] [US5] Create `/admin/email-templates` editor page with variable help
- [ ] T019 [P2] [US6] Create `GET /api/v1/admin/landing-ad` and `PUT /api/v1/admin/landing-ad` endpoints
- [ ] T020 [P2] [US6] Update `/` home page to render active landing ad HTML
- [ ] T021 [P2] [US6] Create `/admin/landing-ad` editor page
- [ ] T022 [P2] [US5, US6] Add tests for templates and landing ad

## Phase 4: User Management

- [ ] T023 [P2] [US7] Create `GET /api/v1/admin/users?role=...` with pagination, search, filter
- [ ] T024 [P2] [US7] Create `PATCH /api/v1/admin/users/:id/status` endpoint to block/unblock
- [ ] T025 [P2] [US7] Create `POST /api/v1/admin/users/:id/bonus-credits` endpoint
- [ ] T026 [P2] [US7] Create `POST /api/v1/admin/companies/:id/bonus-access-codes` endpoint
- [ ] T027 [P2] [US7] Create `/admin/users` page with personal/company tabs, grids, search, block/unblock, bonus actions
- [ ] T028 [P2] [US7] Add tests for user management endpoints and page

## Phase 5: Content Management

- [ ] T029 [P2] [US8] Create admin CRUD endpoints for `Technology`
- [ ] T030 [P2] [US8] Create admin CRUD endpoints for `Question` and `Answer`
- [ ] T031 [P2] [US8] Create `/admin/technologies` content management page
- [ ] T032 [P2] [US8] Create `/admin/technologies/:id/questions` question editor page
- [ ] T033 [P2] [US8] Add end-to-end tests for technology/question/answer CRUD

## Phase 6: Polish

- [ ] T034 [P3] Document 2FA as future work in `docs/roadmap/admin-2fa.md` or ADR
- [ ] T035 [P2] Run full test suite and production build
- [ ] T036 [P2] Update `CHANGELOG.md`

## Execution Order

Phase 1 → Phase 2 → Phase 3 → Phase 4 → Phase 5 → Phase 6.

Dependencies across phases are minimal: Phase 2 needs Phase 1 auth; Phase 3/4/5 can start once Phase 1 is complete.
