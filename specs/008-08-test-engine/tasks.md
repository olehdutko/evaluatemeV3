# Test Engine Tasks

## Domain / Schema

1. [x] Add `Test`, `Question`, `Answer`, `TestSession`, `UserAnswer` entities to `packages/domain`.
2. [x] Update Prisma schema with new tables and relations.
3. [x] Generate migration / run `db push` on dev and test DBs.

## Backend

4. [x] Implement `StartTestUseCase` — select questions for a technology and create a session.
5. [x] Implement `SubmitAnswerUseCase` — record answer, calculate running score, return next question.
6. [x] Implement `GetTestSessionUseCase`.
7. [x] Implement Prisma repositories for new entities.
8. [x] Create `TestsController` with `POST /api/v1/tests/start`, `POST /api/v1/tests/:sessionId/answer`, `GET /api/v1/tests/:sessionId`.
9. [x] Create `SessionsController` with `POST /api/v1/sessions/start` for access-code flow.
10. [x] Add unit tests for use-cases.
11. [x] Add contract tests for DTOs.
12. [x] Add integration tests (skipped without test DB).

## Frontend

13. [x] Create `/technologies/[slug]/start` page to start a test.
14. [x] Create `/tests/[sessionId]` page to display question and submit answer.
15. [x] Add test API client methods.
16. [x] Add unit tests for components.
