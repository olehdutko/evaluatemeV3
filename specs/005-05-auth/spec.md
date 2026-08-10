# Feature Specification: Authentication

**Feature Branch**: `005-05-auth`

**Created**: 2026-08-10

**Status**: Implemented

**Input**: User description: "Implement user authentication for EvaluateMe v3: personal users and admins authenticate via JWT access/refresh tokens; companies and candidates use session tokens. Include registration, login, token refresh, logout, and secure password handling with bcrypt."

## User Scenarios & Testing

### User Story 1 — P1: Personal User / Admin Registration and Login

As a personal user or admin, I need to register with email and password and log in to receive JWT access and refresh tokens so that I can access protected resources.

**Why this priority**: Authentication is the gateway for all user-facing features.

**Independent Test**: API contract tests + integration tests hit `POST /api/v1/auth/register` and `POST /api/v1/auth/login` and verify JWT issuance and envelope shape.

**Acceptance Scenarios**:

1. **Given** a unique email and valid password, **When** `POST /api/v1/auth/register` is called, **Then** a user is created and a success response with user details is returned.
2. **Given** valid credentials, **When** `POST /api/v1/auth/login` is called, **Then** access and refresh tokens are returned.
3. **Given** an invalid password, **When** login is attempted, **Then** a `401 UNAUTHORIZED` error is returned.

### User Story 2 — P2: JWT Token Refresh and Logout

As an authenticated user, I need to refresh my access token using a refresh token and invalidate tokens on logout so that my session remains secure.

**Why this priority**: Token lifecycle is required for secure long-lived sessions.

**Independent Test**: Integration tests verify refresh token exchange and logout revocation.

**Acceptance Scenarios**:

1. **Given** a valid refresh token, **When** `POST /api/v1/auth/refresh` is called, **Then** a new access token is issued.
2. **Given** an authenticated request, **When** `POST /api/v1/auth/logout` is called, **Then** the refresh token is blacklisted and can no longer be used.

### User Story 3 — P3: Session-Based Tokens for Companies/Candidates

As a company or candidate, I need a session token to take tests without a full user account so that candidate flows remain lightweight.

**Why this priority**: Candidate test-taking must work without forcing account creation.

**Independent Test**: Unit tests for session strategy and contract tests for session endpoints.

**Acceptance Scenarios**:

1. **Given** a valid access code, **When** a session token is issued, **Then** the token contains candidate and access-code identifiers.
2. **Given** an expired session token, **When** it is verified, **Then** verification returns `null`.

## Requirements

### Functional Requirements

- **FR-001**: `POST /api/v1/auth/register` accepts `email`, `password`, `role` (`user`, `company`, `admin`) and creates a `User` with `activationStatus = pending`.
- **FR-002**: `POST /api/v1/auth/login` accepts `email`, `password` and returns `accessToken`, `refreshToken`, `expiresInSeconds`.
- **FR-003**: `POST /api/v1/auth/refresh` accepts a refresh token and returns a new access token (same refresh token returned).
- **FR-004**: `POST /api/v1/auth/logout` accepts a refresh token and blacklists it.
- **FR-005**: `SessionStrategyAdapter` creates, verifies, and revokes opaque session tokens for company/candidate flows.

### Non-Functional Requirements

- **NFR-001**: Passwords are hashed with bcrypt at 12 rounds.
- **NFR-002**: JWT access tokens expire after 15 minutes; refresh tokens expire after 7 days.
- **NFR-003**: Token blacklist is implemented as an in-memory store; production should replace with Redis or DB persistence.

## Architecture

- Domain layer defines ports: `IUserRepository`, `IPasswordHasher`, `IJwtStrategy`, `ISessionStrategy`, `ITokenBlacklist`.
- Application layer use-cases: `RegisterUseCase`, `LoginUseCase`, `RefreshUseCase`, `LogoutUseCase`.
- Infrastructure adapters: `BcryptPasswordHasher`, `JwtStrategyAdapter`, `SessionStrategyAdapter`, `InMemoryTokenBlacklist`.
- API layer: `AuthController` under `/api/v1/auth` with endpoints `register`, `login`, `refresh`, `logout`.
- Web layer: `AuthProvider` context, `/login` and `/register` pages, token storage, and middleware route guard.

## Implementation Notes

- `JwtStrategyAdapter` signs access tokens with `JWT_SECRET` and refresh tokens with `JWT_REFRESH_SECRET`.
- `AuthModule` provides all adapters via Symbol-tokens for dependency injection.
- Frontend tokens are stored in `localStorage` as a client-side convenience; the production deployment should switch to httpOnly cookies set by the backend.
- Integration tests require `DATABASE_URL` to be set to a MySQL database. The test suite skips auth integration tests when no database is available.
