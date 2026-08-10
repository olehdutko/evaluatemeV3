# Security MVP Tasks

**Input**: `specs/006-06-security/spec.md`

**Tests**: Executable unit, contract, and integration tests required for each user story.

## Phase 1: Rate Limiting (US1)

### Tests

- [x] T001 [P] [US1] Unit test for `RateLimitStore` in `apps/api/tests/unit/infrastructure/security/in-memory-rate-limit-store.test.ts`
- [x] T002 [P] [US1] Integration test for `POST /api/v1/auth/login` returning `429` after threshold in `apps/api/tests/integration/security/login-rate-limit.integration.test.ts`

### Implementation

- [x] T003 [P] [US1] Define `IRateLimitStore` port in `packages/domain/src/ports/rate-limit-store.port.ts`
- [x] T004 [P] [US1] Implement `InMemoryRateLimitStore` in `apps/api/src/infrastructure/security/in-memory-rate-limit-store.ts`
- [x] T005 [P] [US1] Implement `RateLimitGuard` and `@RateLimit()` in `apps/api/src/infrastructure/security/rate-limit.guard.ts`
- [x] T006 [US1] Apply `RateLimitGuard` to auth controller routes in `apps/api/src/modules/auth/auth.controller.ts`

## Phase 2: Security Headers (US2)

### Tests

- [x] T007 [P] [US2] Integration test asserting security headers on `GET /api/v1/health` in `apps/api/tests/integration/security/security-headers.integration.test.ts`

### Implementation

- [x] T008 [P] [US2] Implement `SecurityHeadersMiddleware` in `apps/api/src/infrastructure/security/security-headers.middleware.ts`
- [x] T009 [US2] Register middleware globally in `apps/api/src/main.ts`

## Phase 3: Role-Based Access Control (US3)

### Tests

- [x] T010 [P] [US3] Unit test for `RolesGuard` in `apps/api/tests/unit/infrastructure/security/roles.guard.test.ts`

### Implementation

- [x] T011 [P] [US3] Create `@Roles()` decorator in `apps/api/src/infrastructure/security/roles.decorator.ts`
- [x] T012 [P] [US3] Implement `RolesGuard` in `apps/api/src/infrastructure/security/roles.guard.ts`
- [x] T013 [US3] Export guard from `AuthModule`

## Phase 4: Audit Logging (US4)

### Tests

- [x] T014 [P] [US4] Unit test for `LogSecurityEventUseCase` in `apps/api/tests/unit/application/security/log-security-event.use-case.test.ts`

### Implementation

- [x] T015 [P] [US4] Create `ISecurityAuditLogger` domain port in `packages/domain/src/ports/security-audit-logger.port.ts`
- [x] T016 [P] [US4] Implement `LogSecurityEventUseCase` in `apps/api/src/application/security/log-security-event.use-case.ts`
- [x] T017 [P] [US4] Implement `ConsoleSecurityAuditLogger` adapter in `apps/api/src/infrastructure/security/security-audit-logger.ts`
- [x] T018 [US4] Emit `AUTH_LOGIN_FAILURE` security audit event from `AuthController`

## Phase 5: Documentation & Integration

- [x] T019 [P] Update `CHANGELOG.md` with security MVP entry
- [x] T020 [P] Run full CI simulation: `npx tsc -b`, `npm run test`, `npm run test:integration`

## Notes

- All rate-limit state is in-memory in MVP; later replaced by Redis-backed store through `IRateLimitStore`.
- Security headers are applied globally; CSP is intentionally strict (`default-src 'none'`) for API-only responses.
- RBAC decorator/guard are reusable for any future module (admin, companies, results).
- Audit logs use the existing structured logger; persistence in `security_events` table is a future extension.
