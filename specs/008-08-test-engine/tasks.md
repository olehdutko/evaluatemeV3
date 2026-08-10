# Test Engine Tasks

## Domain / Schema

1. [ ] Add `Test`, `Question`, `Answer`, `TestSession`, `CandidateSession` entities to `packages/domain`.
2. [ ] Update Prisma schema with new tables and relations.
3. [ ] Generate migration / run `db push` on dev and test DBs.

## Backend

4. [ ] Implement `StartTestUseCase` — select questions for a technology and create a session.
5. [ ] Implement `SubmitAnswerUseCase` — record answer, calculate running score, return next question.
6. [ ] Implement `GetTestSessionUseCase`.
7. [ ] Implement Prisma repositories for new entities.
8. [ ] Create `TestsController` with `POST /api/v1/tests/start`, `POST /api/v1/tests/:sessionId/answer`, `GET /api/v1/tests/:sessionId`.
9. [ ] Create `SessionsController` with `POST /api/v1/sessions/start` for access-code flow.
10. [ ] Add unit tests for use-cases.
11. [ ] Add contract tests for DTOs.
12. [ ] Add integration tests (skipped without test DB).

## Frontend

13. [ ] Create `/technologies/[slug]/start` page to start a test.
14. [ ] Create `/tests/[sessionId]` page to display question and submit answer.
15. [ ] Add test API client methods.
16. [ ] Add unit tests for components.
