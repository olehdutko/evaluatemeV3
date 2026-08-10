# Tasks: Public API Contracts

**Input**: Design documents from `/specs/003-03-api/`

**Prerequisites**: spec.md (required), `specs/001-01-architecture/contracts/api-conventions.md`

**Tests**: Executable contract tests are required because the API is the integration boundary.

## Format: `[ID] [P?] [Story] Description`

---

## Phase 1: API Conventions Document (US1)

- [x] T001 [P] [US1] Create `specs/003-03-api/api-conventions.md` with all convention sections
- [x] T002 [P] [US1] Add contract test in `apps/api/tests/contract/api-conventions.contract.test.ts` validating example payloads against declared Zod schemas
- [x] T003 [P] [US1] Move/merge existing `specs/001-01-architecture/contracts/api-conventions.md` content into `specs/003-03-api/api-conventions.md` and update cross-references

## Phase 2: Endpoint Contract Catalog (US2)

- [x] T004 [P] [US2] Define Zod request/response schemas for `POST /api/v1/auth/register` in `apps/api/src/lib/schemas/auth.schema.ts`
- [x] T005 [P] [US2] Define Zod request/response schemas for `POST /api/v1/auth/login` in `apps/api/src/lib/schemas/auth.schema.ts`
- [x] T006 [P] [US2] Define Zod request/response schemas for `GET /api/v1/tests` list in `apps/api/src/lib/schemas/test.schema.ts`
- [x] T007 [P] [US2] Define Zod request/response schemas for `GET /api/v1/tests/:id` in `apps/api/src/lib/schemas/test.schema.ts`
- [x] T008 [P] [US2] Define Zod request/response schemas for `POST /api/v1/tests` in `apps/api/src/lib/schemas/test.schema.ts`
- [x] T009 [P] [US2] Add contract tests for each schema in `apps/api/tests/contract/` validating happy path and error examples

## Phase 3: Versioning Policy Enforcement (US3)

- [x] T010 [P] [US3] Document versioning policy section in `specs/003-03-api/api-conventions.md`
- [x] T011 [P] [US3] Add ADR `docs/architecture/adr-004-api-versioning.md` documenting the `/api/v1` baseline and `/api/v2` breaking-change policy
- [x] T012 [P] [US3] Ensure existing `api-versioning.integration.test.ts` passes and references the ADR

## Dependencies & Execution Order

- Phase 1 can start immediately.
- Phase 2 depends on the conventions document and existing domain entities.
- Phase 3 depends on existing controller route inspection.

## Notes

- No controller implementation is required in this feature; only contracts and tests.
- Keep schemas DRY by reusing domain entity shapes where possible.
