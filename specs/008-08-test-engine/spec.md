# Feature Specification: Test Engine

**Feature Branch**: `008-08-test-engine`

**Created**: 2026-08-10

**Status**: In Progress

**Input**: Implement the core test-taking engine for EvaluateMe v3: authenticated users can start a test session from a technology, answer questions, submit the test, and receive a score. Companies and candidates can also start lightweight sessions via session tokens and access codes.

## User Scenarios & Testing

### User Story 1 — P1: Start a test from a technology

As an authenticated user, I want to start a test for a selected technology so that I can evaluate my knowledge.

**Why this priority**: This is the core value proposition of the platform.

**Independent Test**: Integration test starts a test session for a technology and receives the first question.

**Acceptance Scenarios**:

1. **Given** an authenticated user on `/technologies`, **When** they click a technology, **Then** they are taken to the test start page.
2. **Given** a technology slug, **When** `POST /api/v1/tests/start` is called, **Then** a `TestSession` is created and the first question is returned.
3. **Given** an invalid technology slug, **When** `POST /api/v1/tests/start` is called, **Then** a `404 NOT_FOUND` error is returned.

### User Story 2 — P1: Answer a question and advance

As a test taker, I want to submit an answer and see the next question so that I can complete the test.

**Why this priority**: Required to complete a test flow.

**Independent Test**: Unit and integration tests verify answer submission and score calculation.

**Acceptance Scenarios**:

1. **Given** an active test session, **When** `POST /api/v1/tests/:sessionId/answer` is called with a selected answer, **Then** the answer is recorded and the next question is returned.
2. **Given** the last question, **When** it is answered, **Then** the test is marked complete and the final score is returned.

### User Story 3 — P2: Session-based test for companies/candidates

As a company or candidate, I want to start a test using a session token and access code so that no full account is required.

**Why this priority**: Supports the lightweight candidate flow required by the product.

**Independent Test**: Unit tests for `SessionStrategyAdapter` and contract tests for session endpoints.

**Acceptance Scenarios**:

1. **Given** a valid access code, **When** `POST /api/v1/sessions/start` is called, **Then** a session token is created and a test session is started.
2. **Given** an expired or invalid access code, **When** start is attempted, **Then** a `401 UNAUTHORIZED` error is returned.

## Requirements

### Functional Requirements

- **FR-001**: `POST /api/v1/tests/start` accepts a `technologySlug` and returns a test session with the first question and possible answers.
- **FR-002**: `POST /api/v1/tests/:sessionId/answer` accepts `questionId` and `answerId`, records the answer, and returns the next question or final score.
- **FR-003**: `GET /api/v1/tests/:sessionId` returns the current state of a test session.
- **FR-004**: `POST /api/v1/sessions/start` accepts an `accessCode` and returns a session token and test session.
- **FR-005**: The test engine randomly selects up to 20 questions per technology by default.
- **FR-006**: Score is calculated as correct answers divided by total questions, returned as a percentage.

### Non-Functional Requirements

- **NFR-001**: Test sessions are isolated per user/session.
- **NFR-002**: Answers are recorded immediately; partial submissions are allowed.
- **NFR-003**: Session tokens for candidate flow expire after 7 days.

## Architecture

- Domain entities: `Test`, `Question`, `Answer`, `TestSession`, `CandidateSession`.
- Application use-cases: `StartTestUseCase`, `SubmitAnswerUseCase`, `GetTestSessionUseCase`.
- Infrastructure: Prisma repositories for new entities, `SessionStrategyAdapter` already exists.
- API controllers: `TestsController`, `SessionsController`.
- Web pages: `/technologies/:slug/start`, `/tests/:sessionId`.
