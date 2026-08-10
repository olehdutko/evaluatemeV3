# Auth Tasks

## Backend

1. [x] Define `AuthTokens` port in domain layer.
2. [x] Implement `RegisterUseCase` with bcrypt hashing (12 rounds).
3. [x] Implement `LoginUseCase` (validate password, issue JWT access + refresh).
4. [x] Implement `RefreshUseCase` (verify refresh token, issue new access, check blacklist).
5. [x] Implement `LogoutUseCase` (blacklist refresh token).
6. [x] Implement `BcryptPasswordHasher` adapter.
7. [x] Implement `JwtStrategyAdapter` adapter.
8. [x] Implement `SessionStrategyAdapter` adapter for company/candidate session tokens.
9. [x] Implement `InMemoryTokenBlacklist` adapter.
10. [x] Create `AuthController` with `/api/v1/auth/register`, `/login`, `/refresh`, `/logout`.
11. [x] Create `AuthModule` and wire into `AppModule`.
12. [x] Add unit tests for use-cases and adapters.
13. [x] Add contract tests for auth DTOs.
14. [x] Add integration tests (skipped when no test DB is available; run with `DATABASE_URL` set).
15. [ ] Add a persistent token blacklist (Redis/DB) for production.

## Frontend

1. [x] Add auth API client methods (`register`, `login`, `refresh`, `logout`).
2. [x] Build `/login` and `/register` pages with forms.
3. [x] Store tokens in `localStorage` with expiry (client-safe fallback; production should use httpOnly cookies).
4. [x] Add `AuthProvider` context for global auth state.
5. [x] Add middleware route guard that redirects unauthenticated users to `/login`.
6. [x] Add unit tests for token storage and auth API client.
7. [ ] Implement automatic access-token refresh before API calls.
