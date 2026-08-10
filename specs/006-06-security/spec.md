# Feature Specification: Security MVP

**Feature Branch**: `006-06-security`

**Created**: 2026-08-11

**Status**: In Progress

**Input**: Implement foundational security controls for EvaluateMe v3 that can be extended into a full security feature later. Focus on rate limiting, security headers, role-based access control (RBAC), and audit logging.

## User Scenarios & Testing

### User Story 1 — Rate limiting for authentication endpoints (Priority: P1)

As an operator, I want to limit the number of requests to authentication endpoints per IP so that brute-force and abuse are mitigated.

**Why this priority**: Authentication endpoints are the primary attack surface; rate limiting is the cheapest and most effective first line of defense.

**Independent Test**: Integration tests assert that after the configured number of failed requests from the same IP, subsequent requests receive `429 Too Many Requests` for a short window.

**Acceptance Scenarios**:

1. **Given** a client IP, **When** it exceeds the configured request limit on `/api/v1/auth/login`, **Then** it receives `429` and a clear error envelope.
2. **Given** a rate-limited IP, **When** the window expires, **Then** new requests are allowed.

---

### User Story 2 — Security headers on all API responses (Priority: P1)

As a client, I want the API to return common security headers so that common browser-level attacks are mitigated.

**Why this priority**: Headers are low-cost, high-value hardening that benefits every endpoint immediately.

**Independent Test**: An integration test asserts that `GET /api/v1/health` returns `X-Content-Type-Options`, `X-Frame-Options`, `X-XSS-Protection`, and a strict `Content-Security-Policy` header.

**Acceptance Scenarios**:

1. **Given** any API request, **When** the response is returned, **Then** it includes the configured security headers.
2. **Given** a preflight `OPTIONS` request, **When** CORS is configured, **Then** the response still includes security headers.

---

### User Story 3 — Role-based access control for admin endpoints (Priority: P2)

As an admin, I want endpoints that mutate global settings or user state to be restricted by role so that regular users cannot perform admin actions.

**Why this priority**: Separating admin, company, and user privileges is required before any admin or company-specific endpoints can be trusted.

**Independent Test**: Unit and integration tests assert that a user with role `user` accessing an admin-only route receives `403`, while a user with role `admin` succeeds.

**Acceptance Scenarios**:

1. **Given** an authenticated user with role `user`, **When** they call an admin-only endpoint, **Then** they receive `403 Forbidden`.
2. **Given** an authenticated user with role `admin`, **When** they call the same endpoint, **Then** the request succeeds.

---

### User Story 4 — Audit logging for security events (Priority: P2)

As a security operator, I want failed logins, rate-limit hits, and unauthorized access attempts to be logged with context so that incidents can be investigated.

**Why this priority**: Detection and forensic ability are required to respond to abuse even when prevention succeeds.

**Independent Test**: Unit tests assert that the security logger is called with the correct event code and metadata for failed login, rate limit hit, and forbidden access.

**Acceptance Scenarios**:

1. **Given** a failed login attempt, **When** the request completes, **Then** a security audit log entry is emitted with IP, email, and outcome.
2. **Given** a rate-limited request, **When** the 429 response is sent, **Then** a security audit log entry is emitted.

## Requirements

### Functional Requirements

- **FR-001**: The API MUST apply per-IP rate limiting to `POST /api/v1/auth/login`, `POST /api/v1/auth/register`, `POST /api/v1/auth/refresh`, and `POST /api/v1/auth/logout`.
- **FR-002**: Rate-limited requests MUST receive HTTP `429` with a `{ success: false, error: { code: 'TOO_MANY_REQUESTS' } }` envelope.
- **FR-003**: The API MUST return `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `X-XSS-Protection: 1; mode=block`, and `Content-Security-Policy: default-src 'none'` on every response.
- **FR-004**: A `@Roles()` decorator and `RolesGuard` MUST restrict controller routes to users whose JWT `role` claim matches one of the allowed roles.
- **FR-005**: Security events (failed login, rate limit hit, unauthorized access) MUST be logged via the existing structured logger with a `security` tag, event code, IP, and user identifier when available.

### Key Entities

- **SecurityEvent**: Domain concept representing a security-relevant occurrence (eventCode, ip, userId?, email?, outcome, timestamp). Not persisted in MVP; logged only.
- **RateLimitWindow**: Infrastructure concept tracking requests per IP per window.

### Success Criteria

- **SC-001**: Brute-force attempts against `/api/v1/auth/login` are blocked after the configured threshold.
- **SC-002**: 100% of API responses include the required security headers.
- **SC-003**: Admin-only routes reject non-admin users with `403`.
- **SC-004**: Every failed login and rate-limit hit produces a structured log line.

## Architecture & Non-Functional Constraints

- Business logic MUST be framework-independent and live in Domain and Application layers.
- External input MUST be validated; rate-limit state MUST use parameterized or in-memory tracking only.
- Persistence MUST be abstracted so rate-limit storage can later be replaced by Redis without changing Domain or Application code.
- The feature MUST be testable with unit, integration, and API tests without Docker or container-dependent workflows.

## Future Extensions

- Redis-backed distributed rate limiting.
- Persistent `security_events` table for audit trails and dashboards.
- CSP nonce support for inline scripts in frontend pages.
- CSRF token validation for state-changing browser requests.
- Account lockout after repeated failed logins.
- Suspicious IP detection and alerting.
