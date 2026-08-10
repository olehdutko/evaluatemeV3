# Feature Specification: Public API Contracts

**Feature Branch**: `003-03-api`

**Created**: 2026-08-10

**Status**: Draft

**Input**: User description: "Define and document the public REST API contracts for v3, including request/response schemas, error envelopes, authentication, pagination, and versioning conventions, so that frontend and backend teams share a single source of truth."

## User Scenarios & Testing

### User Story 1 — P1: API Conventions Document

As an API consumer, I need a published conventions document describing URL versioning, HTTP methods, response envelopes, error codes, pagination, filtering, sorting, and idempotency so that I can integrate with EvaluateMe v3 consistently.

**Why this priority**: Without documented conventions, every endpoint invents its own shape, making the frontend fragile and the API hard to evolve.

**Independent Test**: A contract test parses every published convention example and confirms the examples match the declared schemas.

**Acceptance Scenarios**:

1. **Given** a `GET /api/v1/health` response, **When** validated against the health schema, **Then** it matches the success envelope defined in the conventions.
2. **Given** a validation error, **When** serialized, **Then** it matches the error envelope with `code`, `message`, and optional `details`.

### User Story 2 — P2: Endpoint Contract Catalog

As a backend developer, I need OpenAPI-style endpoint contracts for the architecture-foundation endpoints (`/api/v1/health`, `/api/v1/technologies`) and the next high-priority endpoints (`/api/v1/auth/*`, `/api/v1/users/*`, `/api/v1/tests/*`) so that I can implement and test against the same contract.

**Why this priority**: Endpoint-by-endpoint contracts make parallel development possible and give QA concrete expectations.

**Independent Test**: Contract tests for each endpoint assert request and response shapes using Zod schemas.

**Acceptance Scenarios**:

1. **Given** a `POST /api/v1/auth/register` request body, **When** validated, **Then** required fields (`email`, `password`, `role`) are enforced and optional fields are accepted.
2. **Given** a `GET /api/v1/tests` list response, **When** validated, **Then** it returns the paginated envelope with `data` and `meta`.

### User Story 3 — P3: API Versioning and Breaking-Change Policy

As a platform owner, I need a documented API versioning policy so that breaking changes are introduced under `/api/v2/` with a deprecation period.

**Why this priority**: Versioning policy protects existing consumers when the API evolves.

**Independent Test**: A smoke test asserts all registered routes are under `/api/v1` and no route exposes `/api/v2` without an explicit ADR.

**Acceptance Scenarios**:

1. **Given** the current codebase, **When** routes are inspected, **Then** every controller path starts with `/api/v1`.
2. **Given** a breaking change proposal, **When** reviewed, **Then** it requires an ADR and a deprecation period.

## Requirements

### Functional Requirements

- **FR-001**: The API conventions document MUST live at `specs/003-03-api/api-conventions.md` and cover base URL, HTTP methods, content types, authentication, response envelopes, pagination, sorting, filtering, error codes, validation errors, idempotency, health endpoint, versioning policy, and security headers.
- **FR-002**: Endpoint contracts MUST be defined as Zod schemas in `apps/api/src/lib/schemas/` or `packages/domain/src/contracts/`.
- **FR-003**: Every endpoint contract MUST include request schema, response schema, and error response examples.
- **FR-004**: The API versioning policy MUST state that all v3 endpoints are under `/api/v1` and breaking changes require `/api/v2` with deprecation.
- **FR-005**: Authentication contracts MUST distinguish JWT for users/admins and session tokens for companies/candidates.

### Key Contracts

- **SuccessEnvelope**: `{ success: true, data: T, meta?: PaginationMeta | null }`
- **ErrorEnvelope**: `{ success: false, error: { code, message, details? }, meta: null }`
- **PaginationMeta (offset)**: `{ page, perPage, total }`
- **PaginationMeta (cursor)**: `{ nextCursor, hasMore }`
- **AuthToken**: JWT access/refresh or session token cookie.

## Success Criteria

- **SC-001**: All convention examples are parseable by Zod schemas.
- **SC-002**: At least 5 endpoint contracts are documented with request/response schemas.
- **SC-003**: API versioning smoke test passes.
- **SC-004**: No endpoint deviates from the documented envelope without an ADR.

## Architecture & Non-Functional Constraints

- Contracts MUST be technology-agnostic where possible and implemented as TypeScript Zod schemas.
- The frontend MUST validate responses against the same schemas as the backend generates.
- Contracts MUST be versioned alongside the API version they describe.
- No Docker or container-dependent workflows.

## Assumptions

- The first implemented endpoints (`health`, `technologies`) follow the conventions.
- Future feature specs will reference this document instead of redefining conventions.
- Auth provider details will be specified in `005-05-auth`.
