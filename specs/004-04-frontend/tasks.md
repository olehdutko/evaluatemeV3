# Tasks: Frontend Foundation

**Input**: Design documents from `/specs/004-04-frontend/`

**Prerequisites**: spec.md (required), `specs/003-03-api/api-conventions.md`

**Tests**: Unit and integration tests required for layout, API client, and components.

## Format: `[ID] [P?] [Story] Description`

---

## Phase 1: Shared Layout (US1)

- [x] T001 [P] [US1] Create root layout `apps/web/src/app/layout.tsx` with HTML shell, metadata, header, main, footer
- [x] T002 [P] [US1] Create `apps/web/src/components/layout/Header.tsx` with navigation links
- [x] T003 [P] [US1] Create `apps/web/src/components/layout/Footer.tsx`
- [x] T004 [P] [US1] Add unit test `apps/web/tests/unit/components/layout/Header.test.tsx` asserting navigation links
- [x] T005 [P] [US1] Add unit test `apps/web/tests/unit/app/layout.test.tsx` asserting children render inside layout

## Phase 2: Typed API Client (US2)

- [x] T006 [P] [US2] Update `apps/web/src/lib/api-client.ts` with Zod-validated fetch wrapper and `ApiError`
- [x] T007 [P] [US2] Add `apps/web/src/lib/schemas/api-error.schema.ts` for error envelope parsing
- [x] T008 [P] [US2] Add unit test `apps/web/tests/unit/lib/api-client.test.ts` with mocked fetch + Zod validation
- [x] T009 [P] [US2] Update `apps/web/src/lib/health.api.ts` and `apps/web/src/lib/technology.api.ts` to use the new client
- [x] T010 [P] [US2] Add unit test `apps/web/tests/unit/lib/health.api.test.ts`

## Phase 3: Reusable Components and Pages (US3)

- [x] T011 [P] [US3] Create `apps/web/src/components/ui/PageHeader.tsx`
- [x] T012 [P] [US3] Create `apps/web/src/components/ui/Loading.tsx`
- [x] T013 [P] [US3] Create `apps/web/src/components/ui/ErrorMessage.tsx`
- [x] T014 [P] [US3] Create `apps/web/src/components/ui/StatusBadge.tsx`
- [x] T015 [P] [US3] Add unit tests for each UI component in `apps/web/tests/unit/components/ui/`
- [x] T016 [P] [US3] Update `apps/web/src/app/page.tsx` (home) with PageHeader and links
- [x] T017 [P] [US3] Update `apps/web/src/app/technologies/page.tsx` with Loading/Error states
- [x] T018 [P] [US3] Update `apps/web/src/app/health/page.tsx` with StatusBadge and error state
- [x] T019 [P] [US3] Add integration/smoke test `apps/web/tests/integration/pages.integration.test.tsx` verifying pages render

## Dependencies & Execution Order

- Phase 1 can start immediately.
- Phase 2 depends on Phase 1 (client used by pages).
- Phase 3 depends on Phases 1 and 2.

## Notes

- Keep components server-first unless interactivity is required.
- Use Zod schemas from `apps/web/src/lib/schemas/`.
- Ensure `npm run lint` passes for `apps/web`.
